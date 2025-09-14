import type { AppConfig } from "../../config.js";
import helmet from "koa-helmet";
import { instanceCachingFactory } from "tsyringe";
import emptyMiddleware from "../../lib/middleware/empty.js";
export default {
   token: "middleware.helmet",
   useFactory: instanceCachingFactory(container => {
      // Maybe should be config.useHelmet?
      const config = container.resolve<AppConfig>("config");
      // @ts-ignore, works fine on separated repo with same deps and settings, can't understand why it complains here.
      const helmetMiddleware = helmet({
         crossOriginResourcePolicy: false,
         contentSecurityPolicy: {
            directives: {
               defaultSrc: ["'self'"],
               scriptSrc: ["'self'", "cdnjs.cloudflare.com", "'unsafe-inline'"],
               // need for swagger
               styleSrc: ["'self'", "cdnjs.cloudflare.com", "fonts.googleapis.com", "'unsafe-inline'"],
               // need for swagger
               fontSrc: ["'self'", "fonts.gstatic.com"],
               // need for swagger
               imgSrc: ["'self'", "http://127.0.0.1:5173"]
            }
         }
      });
      return config.env === "production" ? helmetMiddleware : emptyMiddleware;
   })
};