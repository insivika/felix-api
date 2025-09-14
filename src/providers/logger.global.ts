import { TransportMultiOptions, TransportSingleOptions, pino } from "pino";
import { instanceCachingFactory } from "tsyringe";
import type { AppConfig } from "../config.js";
export default {
   token: "logger.global",
   useFactory: instanceCachingFactory(container => {
      const config = container.resolve<AppConfig>("config");
      let transport: TransportSingleOptions | TransportMultiOptions;
      switch (config.env) {
         case "production":
            transport = {
               targets: [
               // {
               //    target: "@logtail/pino",
               //    options: { sourceToken: config.logtail.token },
               // },
               {
                  target: "cloud-pine",
                  options: {
                     cloudLoggingOptions: {
                        defaultLabels: {
                           environment: config.app.env
                        }
                     }
                  }
               }]
            };
            break;
         case "testing":
            transport = {
               target: "pino/file",
               options: {
                  destination: "/dev/null"
               }
            };
            break;
         default:
            {
               transport = {
                  target: "pino-pretty"
               };
            }
      }
      return pino({
         transport,
         level: config.app.loglevel,
         redact: {
            paths: ["req.headers.authorization", "token"],
            censor: "***"
         }
      });
   })
};