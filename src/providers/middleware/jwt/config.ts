import { instanceCachingFactory } from "tsyringe";
import type { AppConfig } from "../../../config.js";
import AuthService from "../../../services/auth.js";
import { Context } from "koa";
export default {
   token: "middleware.jwt.config",
   useFactory: instanceCachingFactory(container => {
      const config = container.resolve<AppConfig>("config");
      const keys = container.resolve<{
         private: Buffer;
         public: Buffer;
      }>("middleware.jwt.config.keys");
      return {
         secret: keys.public,
         algorithms: ["RS256"],
         issuer: config.auth.jwt.issuer,
         isRevoked: async (ctx: Context, decodedToken: object) => {
            const authService = ctx.state.container.resolve(AuthService);
            if (!("jti" in decodedToken && typeof decodedToken.jti === "string")) {
               return true;
            }
            return authService.isRevoked(decodedToken.jti);
         }
      };
   })
};