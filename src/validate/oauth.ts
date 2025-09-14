import { OAuthProviders } from "../constants.js";
import joi from "joi";
export const oauthUrlSchema = joi.object<OAuthUrlSchema>().keys({
   provider: joi.string().valid(...Object.values(OAuthProviders)).required()
});
export interface OAuthUrlSchema {
   provider: OAuthProviders;
}