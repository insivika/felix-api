import { instanceCachingFactory } from "tsyringe";
import Knex from "knex";
import type { AppConfig } from "../config.js";
export default {
   token: "db",
   useFactory: instanceCachingFactory(container => {
      const config = container.resolve<AppConfig>("config");
      return Knex({
         ...config.db
      });
   })
};