import { instanceCachingFactory } from "tsyringe";
import containerMiddleware from "../../lib/middleware/container.js";
export default {
   token: "middleware.container",
   useFactory: instanceCachingFactory(() => {
      // Maybe should be config.useHelmet?
      return containerMiddleware();
   })
};