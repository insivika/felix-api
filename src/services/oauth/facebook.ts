import { inject, injectable } from "tsyringe";
import OAuthBaseAdapter, { OAuthAdapterExtractedUser } from "./base.js";
import type { AppConfig } from "../../config.js";
import { JwtPayload } from "jsonwebtoken";
@injectable()
export default class OAuthFacebookAdapter implements OAuthBaseAdapter {
   constructor(@inject("config")
   private config: AppConfig) {}
   async extractUserInfo(payload: JwtPayload): Promise<OAuthAdapterExtractedUser> {
      return {
         agentId: this.config.repliers.clients.defaultAgentId,
         email: payload["email"],
         fname: payload["given_name"],
         lname: payload["family_name"],
         status: true
      };
   }
}