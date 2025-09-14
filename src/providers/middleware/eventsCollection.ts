import type { AppConfig } from "config.js";
import { instanceCachingFactory } from "tsyringe";
import { Middleware } from "koa";
import EventsCollectionService, { type NotesCollectionPropertiesSelector, type EventsCollectionPropertiesSelector } from "../../services/eventsCollection/eventsCollection.js";
import emptyMiddleware from "../../lib/middleware/empty.js";
type EventsCollectionMiddlewareOptions = {
   allowIncognito: boolean;
};
export interface EventsCollectionMiddlewareFactoryProps {
   selector: EventsCollectionPropertiesSelector;
   notesSelector?: NotesCollectionPropertiesSelector;
   options?: EventsCollectionMiddlewareOptions;
}
export type EventsCollectionMiddleware = (props: EventsCollectionMiddlewareFactoryProps) => Middleware;
export default {
   token: "middleware.eventsCollection",
   useFactory: instanceCachingFactory(container => {
      const config = container.resolve<AppConfig>("config");
      const middlewareFactory: EventsCollectionMiddleware = ({
         selector,
         notesSelector,
         options: {
            allowIncognito
         } = {}
      }) => {
         return (ctx, next) => {
            const eventsCollectionService = ctx.state.container.resolve(EventsCollectionService);
            if (allowIncognito || ctx.state['user']) {
               selector(ctx).then(props => props && eventsCollectionService.eventsCreate(props));
               notesSelector && notesSelector(ctx).then(props => props && eventsCollectionService.noteCreate(props));
            }
            next();
         };
      };
      return config.boss.enabled === false ? () => emptyMiddleware : middlewareFactory;
   })
};