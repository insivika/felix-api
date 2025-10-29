import { Context, Next } from "koa";
import { instanceCachingFactory } from "tsyringe";
import axios from "axios";
import type { AppConfig } from "../../../config.js";
import { ApiError } from "../../../lib/errors.js";

export default {
   token: "middleware.jwt",
   useFactory: instanceCachingFactory((container) => {
      const config = container.resolve<AppConfig>("config");

      return async (ctx: Context, next: Next) => {
         // Extract token from Authorization header
         const authHeader = ctx.headers.authorization;

         if (!authHeader || !authHeader.startsWith("Bearer ")) {
            ctx.throw(new ApiError("No authorization token provided", 401));
            return;
         }

         const token = authHeader.substring(7);

         // Separate try-catch for Strapi validation only
         let userData;
         try {
            const response = await axios.get(
               `${config.strapi.base_url}/api/users/me`,
               {
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
                  timeout: config.strapi.timeout_ms || 5000,
               }
            );
            userData = response.data;
         } catch (error: any) {
            // Only handle Strapi authentication errors here
            if (error.response?.status === 401) {
               ctx.throw(new ApiError("Invalid or expired token", 401));
            } else {
               ctx.throw(
                  new ApiError("Authentication service unavailable", 503)
               );
            }
            return; // Stop here if auth fails
         }

         // Store user info in ctx.state for downstream middleware/routes
         ctx.state.user = {
            sub: userData.id.toString(),
            email: userData.email,
            username: userData.username,
            role: userData.role?.type || "authenticated",
            ...userData,
         };

         // Call next() outside of try-catch so downstream errors aren't caught
         await next();
      };
   }),
};
