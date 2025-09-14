import { Context, Next } from "koa";
import jwt from "koa-jwt";
import compose from "koa-compose";
import { instanceCachingFactory } from "tsyringe";
import { ApiError } from "../../../lib/errors.js";
export default {
   token: "middleware.jwt.passthrough",
   useFactory: instanceCachingFactory(container => {
      const config = container.resolve<jwt.Options>("middleware.jwt.config");
      return compose([jwt({
         ...config,
         passthrough: true
      }), (ctx: Context, next: Next) => {
         const error = ctx.state["jwtOriginalError"];
         if (!error || error.name === "JsonWebTokenError" && error.message === "jwt must be provided") {
            return next();
         }
         throw new ApiError(error.message, 401);
      }]);
   })
};