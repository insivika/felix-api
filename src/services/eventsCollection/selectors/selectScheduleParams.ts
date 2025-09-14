import { injectable } from "tsyringe";
import _debug from "debug";
import { contactScheduleSchema } from "../../../validate/contact.js";
import { maybeClientId } from "../../../lib/utils.js";
import BaseEventCollectionSelector, { EventsCollectionPropertiesSelector } from "./baseEventCollectionSelector.js";
const debug = _debug("repliers:services:SelectScheduleParams");
@injectable()
export default class SelectScheduleParams extends BaseEventCollectionSelector {
   select: EventsCollectionPropertiesSelector = async ctx => {
      const {
         error,
         value
      } = contactScheduleSchema.validate({
         ...ctx.request.body,
         clientId: maybeClientId(ctx.state?.["user"]?.sub)
      });
      if (error) {
         debug("[selectScheduleParams] error %O", error);
         return null;
      }
      const defaults = await this.getDefaults(ctx);
      return {
         ...defaults,
         person: {
            firstName: value.name,
            emails: [{
               value: value.email,
               type: 'main'
            }],
            phones: [{
               value: value.phone,
               type: 'main'
            }]
         },
         property: await this.getProperty(value.mlsNumber),
         type: 'Property Inquiry'
      };
   };
}