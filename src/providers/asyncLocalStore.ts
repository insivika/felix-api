import { instanceCachingFactory } from "tsyringe";
import { AsyncLocalStorage } from 'node:async_hooks';
export default {
   token: "async_local_store",
   useFactory: instanceCachingFactory(() => {
      return new AsyncLocalStorage();
   })
};