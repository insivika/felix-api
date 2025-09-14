import { instanceCachingFactory } from "tsyringe";
import xssMiddleware from "../../lib/middleware/xss.js";
export default {
   token: "middleware.xss",
   useFactory: instanceCachingFactory(() => {
      // Maybe should be config.useHelmet?
      return xssMiddleware();
   })
};