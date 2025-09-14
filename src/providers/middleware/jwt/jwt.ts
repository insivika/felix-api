import jwt from "koa-jwt";
import { instanceCachingFactory } from "tsyringe";
export default {
   token: "middleware.jwt",
   useFactory: instanceCachingFactory(container => {
      const config = container.resolve<jwt.Options>("middleware.jwt.config");
      return jwt(config);
   })
};