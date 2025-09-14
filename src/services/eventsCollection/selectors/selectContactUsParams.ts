import { injectable } from "tsyringe";
import _debug from "debug";
import { maybeClientId } from "../../../lib/utils.js";
import { contactContactusSchema } from "../../../validate/contact.js";
import BaseEventCollectionSelector, { EventsCollectionPropertiesSelector } from "./baseEventCollectionSelector.js";
const debug = _debug("repliers:services:SelectContactUsParams");
@injectable()
export default class SelectContactUsParams extends BaseEventCollectionSelector {
   select: EventsCollectionPropertiesSelector = async ctx => {
      const {
         error,
         value
      } = contactContactusSchema.validate({
         ...ctx.request.body,
         clientId: maybeClientId(ctx.state?.["user"]?.sub)
      });
      if (error) {
         debug("[selectContactUsParams] error %O", error);
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
         type: 'General Inquiry'
      };
   };
}