import { Context, Next } from "koa";
import { Logger } from "pino";
import { instanceCachingFactory } from "tsyringe";
import { randomUUID } from "node:crypto";
import { AsyncLocalStorage } from "node:async_hooks";
export interface IAsyncLocalStore {
   correlationId: string;
   childLogger: Logger;
}

// Middleare to dynamicaly create child logger on each request
export default {
   token: "middleware.logger",
   useFactory: instanceCachingFactory(container => {
      return async (ctx: Context, next: Next) => {
         const logger = container.resolve<Logger>('logger.global');
         let correlationId = ctx.get('x-correlation-id');
         const isUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
         const isUuid = isUuidRegex.test(correlationId);
         if (!isUuid) {
            correlationId = randomUUID();
         }
         const childLogger = logger.child({
            url: ctx.req.url,
            endpoint: ctx.request.path,
            body: ctx.request.body,
            referer: ctx.get('referer'),
            'x-forwarded-for': ctx.get('x-forwarded-for'),
            correlationId
         });
         const asyncLocalStore = container.resolve<AsyncLocalStorage<IAsyncLocalStore>>('async_local_store');
         const store = {
            correlationId,
            childLogger
         };
         await asyncLocalStore.run(store, async () => {
            await next();
         });
      };
   })
};