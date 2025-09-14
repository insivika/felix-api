import type { UserRole } from "../../constants.js";
import type { Context, Middleware, Next } from "koa";
import { instanceCachingFactory } from "tsyringe";
import { ApiError } from "../../lib/errors.js";
export type RoleMiddlewareCreator = (roles: UserRole[]) => Middleware;
export default {
   token: "middleware.role",
   useFactory: instanceCachingFactory<RoleMiddlewareCreator>(() => {
      return (roles: UserRole[]) => (ctx: Context, next: Next) => {
         if (!roles.includes(ctx.state["user"].role)) {
            throw new ApiError("Insufficient privileges", 403);
         }
         return next();
      };
   })
};