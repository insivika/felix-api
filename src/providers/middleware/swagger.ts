import { instanceCachingFactory } from "tsyringe";
import { koaSwagger } from "koa2-swagger-ui";
import type { AppConfig } from "../../config.js";
import emptyMiddleware from "../../lib/middleware/empty.js";
import swaggerJSDoc from "swagger-jsdoc";
export default {
   token: "middleware.swagger",
   useFactory: instanceCachingFactory(container => {
      const config = container.resolve<AppConfig>("config");
      const options: swaggerJSDoc.OAS3Options = {
         definition: {
            openapi: "3.1.0",
            info: {
               title: "Repliers Portal Swagger",
               version: "1.0.0"
            },
            components: {
               securitySchemes: {
                  bearerAuth: {
                     type: "http",
                     scheme: "bearer",
                     bearerFormat: "JWT"
                  }
               }
            }
         },
         apis: ["./src/**/*.ts", "./dist/**/*.js"]
      };
      return config.app.useSwagger ? koaSwagger({
         routePrefix: "/swagger",
         // host at /swagger instead of default /docs
         hideTopbar: true,
         exposeSpec: true,
         swaggerOptions: {
            jsonEditor: true,
            spec: swaggerJSDoc(options) as Record<string, unknown>
         }
      }) : emptyMiddleware;
   })
};