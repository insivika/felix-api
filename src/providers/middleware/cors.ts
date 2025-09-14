import type { AppConfig } from "../../config.js";
import cors from "@koa/cors";
import { instanceCachingFactory } from "tsyringe";
import type { Logger } from "pino";
export default {
   token: "middleware.cors",
   useFactory: instanceCachingFactory(container => {
      // Maybe should be config.useHelmet?
      const config = container.resolve<AppConfig>("config");
      const log = container.resolve<Logger>("logger.global");
      const corsMiddleware = cors({
         origin: ctx => {
            log.debug("Got origin: %s", ctx.get("origin"));
            const validDomains = config.app.cors.validDomains;
            const origin = ctx.get("origin");
            if (validDomains.some(domain => !!origin.match(domain))) {
               return origin;
            }
            return validDomains[0];
         }
      });
      return config.env === "production" ? corsMiddleware : cors({
         origin: "*"
      });
   })
};