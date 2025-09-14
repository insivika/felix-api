import { DependencyContainer, instanceCachingFactory } from "tsyringe";
import { isFromFollowUpBoss } from "../../lib/boss/auth.js";
import { AppConfig } from "../../config.js";
import { ApiError } from "../../lib/errors.js";
import type { Middleware } from "koa";
export default {
   token: "middleware.boss.webhook.auth",
   useFactory: instanceCachingFactory((container: DependencyContainer): Middleware => {
      const config = container.resolve<AppConfig>("config");
      return async (ctx, next) => {
         // @ts-ignore
         const context = ctx.req.body[Symbol.for("unparsedBody")];
         const signature = ctx.get("fub-signature");
         if (isFromFollowUpBoss(context, signature, config.boss.system_key)) {
            return next();
         }
         throw new ApiError("Invalid signature", 401);
      };
   })
};