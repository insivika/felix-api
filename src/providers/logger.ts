import { DependencyContainer } from "tsyringe";
import _debug from 'debug';
import { AsyncLocalStorage } from "node:async_hooks";
import { IAsyncLocalStore } from "./middleware/logger.js";
const debug = _debug('repliers:middleware:logger');
export default {
   token: 'logger',
   useFactory: (container: DependencyContainer) => {
      const asyncLocalStorage = container.resolve<AsyncLocalStorage<IAsyncLocalStore>>("async_local_store");
      debug('Resolving child logger');
      const store = asyncLocalStorage.getStore();
      if (!store) {
         return container.resolve("logger.global");
      }
      return store.childLogger;
   }
};