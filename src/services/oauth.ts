import { OAuthProviders, UserRole } from "../constants.js";
import type { AppConfig } from "../config.js";
import { Client } from "openid-client";
import { container, inject, injectable } from "tsyringe";
import { ApiError } from "../lib/errors.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import AuthService, { agentProfilKeys, AuthResponseDto, userProfilKeys } from "./auth.js";
import { IncomingMessage } from "http";
import RepliersClients, { RplClientsClient } from "./repliers/clients.js";
import RepliersAgents, { RplAgentsAgent } from "./repliers/agents.js";
import OAuthGoogleAdapter from "./oauth/google.js";
import OAuthBaseAdapter from "./oauth/base.js";
import OAuthFacebookAdapter from "./oauth/facebook.js";
import _ from "lodash";
import _debug from "debug";
import EventsCollectionService from "./eventsCollection/eventsCollection.js";
import BossService from "./boss.js";
import SelectClientRegistrationParams from "./eventsCollection/selectors/selectClientRegistrationParams.js";
import type { Logger } from "pino";
const debug = _debug("repliers:services:oauth");
@injectable()
export default class OAuthService {
   constructor(@inject("logger")
   private logger: Logger, @inject("config")
   // used normally for each request
   private config: AppConfig, private repliersClients: RepliersClients, private repliersAgents: RepliersAgents, private authService: AuthService, private eventsCollection: EventsCollectionService, private boss: BossService, private registerClientSelector: SelectClientRegistrationParams) {}
   private adapters: Record<OAuthProviders, OAuthBaseAdapter> = {
      facebook: container.resolve(OAuthFacebookAdapter),
      google: container.resolve(OAuthGoogleAdapter)
   };
   public async url(provider: OAuthProviders) {
      const client = await container.resolve<Promise<Client>>(`oauth.${provider}`);
      const scopes = this.config.auth.oauth[provider].scopes;
      return client.authorizationUrl({
         scope: scopes
      });
   }
   public async callback(provider: OAuthProviders, req: IncomingMessage): Promise<AuthResponseDto> {
      debug("callback for %s", provider);
      const client = await container.resolve<Promise<Client>>(`oauth.${provider}`);
      const params = client.callbackParams(req);
      const redirectUri = this.config.auth.oauth[provider].redirect_uri;
      const tokens = await client.callback(redirectUri, params);
      if (!tokens.id_token) {
         this.logger.error({
            data: {
               req
            }
         }, `400 - [OAuthService: callback]:  No id_token recieved from ${provider}, probably insufficient scopes configured for app`);
         throw new ApiError(`No id_token recieved from ${provider}, probably insufficient scopes configured for app`, 400);
      }
      const userInfo = jwt.decode(tokens.id_token, {
         json: true
      });
      if (!userInfo) {
         this.logger.error({
            data: {
               req
            }
         }, "400 - [OAuthService: callback]: Cant decode id_token from ${provider}");
         throw new ApiError(`Cant decode id_token from ${provider}`, 400);
      }
      debug("userInfo: %O", userInfo);
      const maybeClients = await this.repliersClients.filter({
         email: userInfo["email"]
      });
      let user: RplClientsClient;
      const payload: JwtPayload = {};

      // If user doesn't exist, it's first time signup or maybe agent login
      if (maybeClients.clients[0] === undefined) {
         const maybeAgents = await this.repliersAgents.filter({
            email: userInfo["email"],
            status: true
         });
         const maybeAgent = this.getAgentWithEmail(userInfo["email"], maybeAgents.agents);
         if (maybeAgent) {
            debug("Agent logging in: %O", maybeAgent);
            return this.agentLogin(maybeAgent);
         } else {
            debug("user doesn't exist, creating new user");
            const userProfile = await this.adapters[provider].extractUserInfo(userInfo, tokens.access_token);
            user = await this.repliersClients.create({
               ...userProfile
            });
            // no await here, we don't want to wait for this to finish
            // TODO: we need to move this to NATS queue for those servers that use NATS
            this.reportClientRegistration(user, provider);
         }
      } else {
         // user exists
         user = maybeClients.clients[0];
      }
      payload["email"] = userInfo["email"];
      payload["sub"] = user.clientId.toString();
      const token = await this.authService.generateToken(payload);
      const profile = _.pick(user, userProfilKeys);
      return {
         token,
         profile
      };
   }
   private getAgentWithEmail(email: string, agents: RplAgentsAgent[]) {
      return agents.find(agent => agent.email.toLowerCase() === email.toLowerCase());
   }
   private async agentLogin(agent: RplAgentsAgent) {
      const fubUser = await this.boss.getUsers({
         email: agent.email
      });
      const payload: JwtPayload = {
         email: agent.email,
         sub: agent.agentId.toString(),
         role: UserRole.Agent,
         external: {
            fub_id: fubUser?.users?.[0]?.id
         }
      };
      const token = await this.authService.generateToken(payload);
      const profile = _.pick(agent, agentProfilKeys);
      debug("[agentLogin]: profile: %O", profile);
      return {
         token,
         profile
      };
   }
   private async reportClientRegistration(user: RplClientsClient, provider: string) {
      const params = await this.registerClientSelector.select({
         user,
         provider
      });
      if (!params) {
         debug("reportClientRegistration: params is null");
         return;
      }
      this.eventsCollection.eventsCreate(params);
   }
}