import { IncomingMessage } from "http";
import { inject, injectable } from "tsyringe";
import { Client, Issuer, TokenSet } from "openid-client";
import SocialProviderBase from "./base.js";
import { ApiError } from "../../../lib/errors.js";
import type { AppConfig } from "../../../config.js";
@injectable()
export default class PinterestSocialProvider implements SocialProviderBase {
   private client: Client;
   constructor(@inject("config")
   private config: AppConfig) {
      const {
         Client
      } = new Issuer({
         issuer: "https://pinterest.com",
         authorization_endpoint: "https://www.pinterest.com/oauth/",
         token_endpoint: "https://api.pinterest.com/v5/oauth/token"
      });
      this.client = new Client({
         client_id: this.config.auth.social.pinterest.client_id,
         client_secret: this.config.auth.social.pinterest.client_secret,
         id_token_encrypted_response_alg: ""
      });
   }
   getUrl() {
      return this.client.authorizationUrl({
         scope: this.config.auth.social.pinterest.scopes,
         redirect_uri: this.config.auth.social.pinterest.redirect_uri
      });
   }
   callback(req: IncomingMessage) {
      const params = this.client.callbackParams(req);
      return this.client.oauthCallback(this.config.auth.social.pinterest.redirect_uri, params);
   }
   refresh(params: TokenSet) {
      if (!params.refresh_token) {
         throw new ApiError("No refresh token", 400);
      }
      return this.client.refresh(params.refresh_token);
   }
}