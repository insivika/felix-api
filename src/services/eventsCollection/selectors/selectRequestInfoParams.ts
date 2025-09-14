import { injectable } from "tsyringe";
import _debug from "debug";
import { contactRequestInfoSchema } from "../../../validate/contact.js";
import { maybeClientId } from "../../../lib/utils.js";
import BaseEventCollectionSelector, { EventsCollectionPropertiesSelector } from "./baseEventCollectionSelector.js";
const debug = _debug("repliers:services:SelectRequestInfoParams");
@injectable()
export default class SelectRequestInfoParams extends BaseEventCollectionSelector {
   select: EventsCollectionPropertiesSelector = async ctx => {
      const {
         error,
         value
      } = contactRequestInfoSchema.validate({
         ...ctx.request.body,
         clientId: maybeClientId(ctx.state?.["user"]?.sub)
      });
      if (error) {
         debug("[selectSselectRequestInfoParams] error %O", error);
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
         message: value.message,
         property: await this.getProperty(value.mlsNumber),
         type: 'Inquiry'
      };
   };
}