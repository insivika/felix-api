import { instanceCachingFactory } from "tsyringe";
import compress from 'koa-compress';
export default {
   token: "middleware.compress",
   useFactory: instanceCachingFactory(() => {
      return compress();
   })
};