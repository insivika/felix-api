import sslify, { xForwardedProtoResolver as resolver } from 'koa-sslify';
import type { AppConfig } from "../../config.js";
import { instanceCachingFactory } from "tsyringe";
import emptyMiddleware from "../../lib/middleware/empty.js";
export default {
   token: "middleware.sslify",
   useFactory: instanceCachingFactory(container => {
      // Maybe should be config.useHelmet?
      const config = container.resolve<AppConfig>("config");
      const sslifyMiddleware = sslify.default({
         resolver
      });
      return config.env === "production" ? sslifyMiddleware : emptyMiddleware;
   })
};