import { AppConfig } from "../../config.js";
import { instanceCachingFactory } from "tsyringe";
import { Issuer } from "openid-client";
export default {
   token: "oauth.google",
   useFactory: instanceCachingFactory(async container => {
      const config = container.resolve<AppConfig>("config");
      const issuer = await Issuer.discover("https://accounts.google.com");
      const {
         Client
      } = issuer;
      return new Client({
         client_id: config.auth.oauth.google.client_id,
         client_secret: config.auth.oauth.google.client_secret,
         redirect_uris: [config.auth.oauth.google.redirect_uri]
      });
   })
};