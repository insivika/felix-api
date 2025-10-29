import crypto from "node:crypto";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { inject, injectable } from "tsyringe";
import Keyv from "keyv";
import _debug from "debug";
import _ from "lodash";
import type { Logger } from "pino";
import ms, { StringValue } from "ms";
import type { AppConfig, JwtSettings } from "../config.js";
import { ApiError } from "../lib/errors.js";
import { BlocklistRepository } from "../repository/blocklist.js";
import {
   AuthEmbedDto,
   AuthRepliersTokenDto,
   UserLoginDto,
   UserOtpDto,
   UserSignupDto,
} from "../validate/auth.js";
import RepliersClients, {
   RplClientsClient,
   RplClientsCreateResponse,
   RplClientsGetResponse,
} from "./repliers/clients.js";
import RepliersMessages from "./repliers/messages.js";
import Codegen from "./auth/codegen.js";
import EventsCollectionService from "./eventsCollection/eventsCollection.js";
import { AclRepository } from "../repository/acl.js";
import { UserRole } from "../constants.js";
import { RplAgentsAgent } from "./repliers/agents.js";
import SelectClientRegistrationParams from "./eventsCollection/selectors/selectClientRegistrationParams.js";
import { BossEmbedContext, isFromFollowUpBoss } from "../lib/boss/auth.js";
import { calcSignature } from "../lib/utils.js";
import StrapiService, { StrapiAuthResponse, StrapiUser } from "./strapi.js";
const debug = _debug("repliers:services:auth");
export type AgentProfile = Pick<
   RplAgentsAgent,
   "email" | "fname" | "lname" | "phone" | "status"
>;
export type UserProfile =
   | Pick<RplClientsClient, "clientId">
   | Pick<
        StrapiUser,
        | "id"
        | "firstName"
        | "lastName"
        | "email"
        | "username"
        | "confirmed"
        | "blocked"
        | "createdAt"
        | "updatedAt"
     >;

export const userProfilKeys = [
   "id",
   "clientId",
   "username",
   "firstName",
   "lastName",
   "email",
   "confirmed",
   "blocked",
   "createdAt",
   "updatedAt",
] as const;

export const agentProfilKeys: Array<keyof AgentProfile> = [
   "fname",
   "lname",
   "email",
   "status",
];
export interface AuthResponseDto {
   user: UserProfile;
   token: string | undefined;
}
export type AuthLoginResponseDto =
   | {
        code: string;
     }
   | undefined;
export interface KeyvClientOtpItem {
   clientId: number;
}
@injectable()
export default class AuthService {
   constructor(
      @inject("logger")
      private logger: Logger,
      @inject("config")
      private config: AppConfig, // used normally for each request
      @inject("middleware.jwt.config.keys")
      private keys: {
         private: Buffer;
         public: Buffer;
      },
      @inject("keyv.otp")
      private db: Keyv,
      private clients: RepliersClients,
      private messages: RepliersMessages,
      private blocklistRepository: BlocklistRepository,
      private codegen: Codegen,
      private eventsCollection: EventsCollectionService,
      private aclRepo: AclRepository,
      private registerClientSelector: SelectClientRegistrationParams,
      private strapiService: StrapiService
   ) {}
   public async generateToken(
      payload: JwtPayload,
      expiresIn?: string
   ): Promise<string> {
      let defaultExpire = this.config.auth.jwt.expire;
      if (!this.config.app.disable_persistence) {
         const acl = await this.aclRepo.getUserAcl(payload["email"]);
         const role = acl?.role || payload["role"] || UserRole.User;
         payload["role"] = role;
         const roleOverride = this.getRoleOverride(role);
         defaultExpire = (roleOverride && roleOverride.expire) || defaultExpire;
         debug(
            `[generateToken]: email: ${payload["email"]}, acl.role: ${acl?.role}, inferred role: ${role}, expire: ${defaultExpire}`
         );
      }
      const signInOptions: SignOptions = {
         // RS256 uses a public/private key pair. The API provides the private key
         // to generate the JWT. The client gets a public key to validate the
         // signature
         algorithm: "RS256",
         expiresIn: (expiresIn || defaultExpire) as StringValue,
         issuer: this.config.auth.jwt.issuer,
         jwtid: crypto.randomUUID(),
      };
      return jwt.sign(payload, this.keys.private, signInOptions);
   }
   private getRoleOverride(role: UserRole): Partial<JwtSettings> | undefined {
      if (
         this.config.auth.roleOverrides &&
         role in this.config.auth.roleOverrides
      ) {
         return this.config.auth.roleOverrides[role]?.jwt;
      }
      return undefined;
   }
   async useOtp(params: UserOtpDto): Promise<AuthResponseDto> {
      const code = await this.db.get<KeyvClientOtpItem>(params.code);
      if (!code) {
         throw new ApiError(
            "The OTP link you follow has already been used or expired. Go to Sign in to request a new link.",
            403
         );
      }
      const user = await this.clients.get(code.clientId);
      const payload: JwtPayload = {
         email: user.email,
         sub: user.clientId.toString(),
      };
      const token = await this.generateToken(payload);
      const profile = _.pick(user, userProfilKeys);
      await this.db.delete(params.code);
      return {
         token,
         profile,
      };
   }

   async login(
      params: UserLoginDto
      // hasUser?: RplClientsGetResponse
   ): Promise<AuthLoginResponseDto | AuthResponseDto> {
      // If password is provided, use Strapi authentication
      if (params.password && params.identifier) {
         const result = await this.loginWithStrapi(
            params.identifier,
            params.password
         );

         return {
            token: result.token,
            user: result.user,
         };
      }

      return {
         token: undefined,
         user: null,
      };

      // // Otherwise, fall back to existing OTP flow
      // let user;
      // if (!hasUser) {
      //    const result = await this.clients.filter({
      //       email: params.identifier,
      //       identifier: params.identifier,
      //    });
      //    user = result.clients.at(0);
      // } else {
      //    user = hasUser;
      // }
      // if (!user.preferences?.email || user.preferences.unsubscribe) {
      //    try {
      //       await this.ensureMailingAllowed(user);
      //    } catch (err) {
      //       debug("Error ensuring user can receive email: %O", err);
      //       this.logger.error(
      //          {
      //             data: {
      //                user,
      //             },
      //          },
      //          "500 - [AuthService: login]: Error ensuring user can receive email"
      //       );
      //       throw new ApiError("Error ensuring user can receive email", 500);
      //    }
      // }
      // const code = await this.sendOtp(user.clientId, user.agentId);
      // return this.config.auth.otp.debug_expose_code
      //    ? {
      //         code,
      //      }
      //    : undefined;
   }
   private async loginWithStrapi(
      email: string,
      password: string
   ): Promise<AuthResponseDto> {
      try {
         const strapiAuth = await this.strapiService.login({
            identifier: email,
            password,
         });

         // Get user from Repliers system
         const result = await this.clients.filter({
            externalId: strapiAuth.user.id.toString(),
         });

         const profile = _.pick(
            {
               ...result.clients[0],
               ...strapiAuth.user,
            },
            userProfilKeys
         );

         return {
            token: strapiAuth.jwt as string,
            user: profile,
         };
      } catch (error) {
         throw error;
      }
   }
   async sendOtp(
      clientId: number,
      agentId = this.config.repliers.clients.defaultAgentId
   ) {
      await this.otpSendRateOpened(clientId);
      const code = this.codegen.generate();
      await this.db.set(
         code,
         {
            clientId,
         },
         this.config.auth.otp.ttl_ms
      );
      await this.db.set(
         this.otpSentKey(clientId),
         Date.now(),
         this.config.auth.otp.resend_ttl_ms
      );
      debug("OTP Code: %s", code);
      const content = this.formatOtpMessageContent(code);
      const message = await this.messages.send({
         agentId,
         clientId,
         sender: "agent",
         content,
      });
      debug("message delivery result: %O", message);
      return code;
   }
   private async otpSendRateOpened(clientId: number) {
      const lastSent = await this.db.get(this.otpSentKey(clientId));
      if (lastSent) {
         this.logger.error(
            {
               data: {
                  clientId,
               },
            },
            "403 - [AuthService: otpSendRateOpened]: You have already requested a new OTP. Please wait before requesting another one."
         );
         throw new ApiError(
            "You have already requested a new OTP. Please wait before requesting another one.",
            403
         );
      }
   }
   private otpSentKey(clientId: number) {
      return `otp_sent_${clientId}`;
   }
   private formatOtpMessageContent(code: string) {
      const linkTypeContent = {
         message: this.config.auth.otp.message,
         links: [`${this.config.auth.otp.uri}?code=${code}`],
      };
      const codeTypeMessage = `${this.config.auth.otp.message} ${code}`;
      switch (this.config.auth.otp.message_type) {
         case "link":
            return linkTypeContent;
         case "code":
            return {
               message: codeTypeMessage,
            };
         case "link_and_code":
            return {
               message: codeTypeMessage,
               links: [`${this.config.auth.otp.uri}?code=${code}`],
            };
         default:
            return linkTypeContent;
      }
   }
   private async ensureMailingAllowed(
      client: RplClientsGetResponse | RplClientsClient
   ) {
      await this.clients.update({
         clientId: client.clientId,
         agentId: client.agentId,
         preferences: {
            email: true,
            unsubscribe: false,
         },
      });
   }
   async refresh(payload: JwtPayload): Promise<{
      token: string;
   }> {
      if (!payload.iat || !payload.exp) {
         this.logger.error(
            {
               data: {
                  payload,
               },
            },
            "500 - [AuthService: refresh]: Token doesn't include expiration info, cant refresh token"
         );
         throw new ApiError(
            "Token doesn't include expiration info, cant refresh token"
         );
      }
      // we don't need iss and jti in payload for new token
      const { iat, exp, iss: _iss, jti: jti, ...newPayload } = payload;
      const diff = exp - iat;
      const expiresIn = `${diff}s`;
      const token = await this.generateToken(newPayload, expiresIn);
      if (jti) {
         // always true
         // Revoking previous token on refresh
         await this.blocklistRepository.create(jti, exp);
      }
      return {
         token,
      };
   }
   async logout(jti: string, exp: number) {
      return this.blocklistRepository.create(jti, exp);
   }
   async isRevoked(jti: string): Promise<boolean> {
      const revoke = await this.blocklistRepository.isRevoked(jti);
      return !!revoke;
   }
   async cleanupExpired() {
      return this.blocklistRepository.cleanupExpired();
   }
   async signup(params: UserSignupDto): Promise<AuthResponseDto> {
      // 1. Register user in Strapi first
      let strapiAuth: StrapiAuthResponse;
      try {
         strapiAuth = await this.strapiService.register({
            username: params.username,
            email: params.email,
            password: params.password,
            firstName: params.firstName,
            lastName: params.lastName,
         });
      } catch (error) {
         throw error;
      }

      // 2. Create or update user in Repliers system
      let userInfo: RplClientsCreateResponse | RplClientsGetResponse | null =
         null;
      try {
         userInfo = await this.clients.create({
            agentId: this.config.repliers.clients.defaultAgentId,
            fname: params.firstName,
            lname: params.lastName,
            email: params.email,
            externalId: strapiAuth.user.id,
            preferences: {
               email: true,
               sms: true,
               unsubscribe: false,
            },
            status: true,
         });
      } catch (error: any) {
         // If user already exists (409), find and update them
         if (error.status === 409 || error.statusCode === 409) {
            const existingUsers = await this.clients.filter({
               email: params.email,
            });
            const existingUser = existingUsers.clients[0];

            if (!existingUser) {
               throw new ApiError("User conflict but not found", 500);
            }

            // Update the existing user
            await this.clients.update({
               clientId: existingUser.clientId,
               agentId: existingUser.agentId,
               fname: params.firstName,
               lname: params.lastName,
               externalId: strapiAuth.user.id,
               preferences: {
                  email: true,
                  sms: true,
                  unsubscribe: false,
               },
               status: true,
            });

            userInfo = await this.clients.get(existingUser.clientId);
         } else {
            throw error;
         }
      }

      if (!userInfo) {
         throw new ApiError("Failed to create or retrieve user", 500);
      }

      const profile = _.pick(
         {
            ...userInfo,
            ...strapiAuth.user,
         },
         userProfilKeys
      ) as UserProfile;

      return {
         token: strapiAuth.jwt as string,
         user: profile,
      };
   }
   async useRepliersToken(params: AuthRepliersTokenDto) {
      if (!this.config.auth.emailtoken.enabled) {
         this.logger.error(
            {
               data: {
                  params,
               },
            },
            "400 - [AuthService: useRepliersToken]: Endpoint is not activated"
         );
         throw new ApiError("Endpoint is not activated", 400);
      }
      const repliersToken = params.token;
      const messageRes = await this.messages.get({
         token: repliersToken,
      });
      if (
         messageRes.messages.length === 0 ||
         messageRes.messages[0] === undefined
      ) {
         this.logger.error(
            {
               data: {
                  params,
               },
            },
            "404 - [AuthService: useRepliersToken]: Email token is invalid"
         );
         throw new ApiError("Email token is invalid", 403);
      }
      const message = messageRes.messages[0];
      if (
         new Date().getTime() -
            new Date(message.delivery.sentDateTime).getTime() >
         ms(this.config.auth.emailtoken.expire as StringValue)
      ) {
         let statusCode = 403;
         let msg = "Email token has expired";
         if (this.config.auth.emailtoken.auto_otp) {
            await this.sendOtp(message.clientId, message.agentId);
            statusCode = 412;
            msg =
               "Email token has expired. Please check your email/text for a new authentication link";
         }
         this.logger.error(
            {
               data: {
                  params,
               },
            },
            `${statusCode} - [AuthService: useRepliersToken]: ${msg}`
         );
         throw new ApiError(msg, statusCode);
      }
      const clientId = messageRes.messages[0].clientId;
      const userInfo = await this.clients.get(clientId);
      const payload: JwtPayload = {
         email: userInfo.email,
         sub: userInfo.clientId.toString(),
      };
      const token = await this.generateToken(payload);
      const profile = _.pick(userInfo, userProfilKeys);
      return {
         token: token,
         profile,
      };
   }
   private async reportClientRegistration(
      user: RplClientsClient,
      referer: string
   ) {
      try {
         const params = await this.registerClientSelector.select({
            user,
            provider: "otp",
            referer,
         });
         if (!params) {
            debug("reportClientRegistration: params is null");
            return;
         }
         this.eventsCollection.eventsCreate(params);
      } catch (err) {
         debug("reportClientRegistration: error %O", err);
      }
   }
   public async embedLogin(params: AuthEmbedDto) {
      const { context, signature } = params;
      const isValid = isFromFollowUpBoss(
         context,
         signature,
         this.config.boss.system_key
      );
      if (!isValid) {
         throw new ApiError("Invalid signature", 401);
      }
      const decodedContext: BossEmbedContext = JSON.parse(
         Buffer.from(context, "base64").toString("utf8")
      );
      const jwt = await this.generateToken({
         email: decodedContext.user.email,
         role: UserRole.Agent,
      });
      const clientSignature = calcSignature(
         decodedContext.person.id.toString(),
         this.config.auth.agents_signature_salt
      );
      return {
         jwt,
         clientSignature,
      };
   }
}
