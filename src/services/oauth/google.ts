import { inject, injectable } from "tsyringe";
import OAuthBaseAdapter, { OAuthAdapterExtractedUser } from "./base.js";
import type { AppConfig } from "../../config.js";
import { JwtPayload } from "jsonwebtoken";
// import axios from "axios";

import _debug from "debug";
const debug = _debug("repliers:services:OAuthGoogleAdapter");
@injectable()
export default class OAuthGoogleAdapter implements OAuthBaseAdapter {
   constructor(@inject("config")
   private config: AppConfig) {}
   async extractUserInfo(payload: JwtPayload, _access_token: string): Promise<OAuthAdapterExtractedUser> {
      const userProfile: OAuthAdapterExtractedUser = {
         agentId: this.config.repliers.clients.defaultAgentId,
         email: payload["email"],
         fname: payload["given_name"],
         lname: payload["family_name"],
         status: true
      };
      debug('userProfile: %o', userProfile);
      return userProfile;
   }
}