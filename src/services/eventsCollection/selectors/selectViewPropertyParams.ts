import { injectable } from "tsyringe";
import _debug from "debug";
import BaseEventCollectionSelector, { EventsCollectionPropertiesSelector } from "./baseEventCollectionSelector.js";
import { RplListingsSingleResponse } from "services/repliers/listings.js";
@injectable()
export default class SelectViewPropertyParams extends BaseEventCollectionSelector {
   select: EventsCollectionPropertiesSelector = async ctx => {
      const defaults = await this.getDefaults(ctx);
      const property = ctx.body as RplListingsSingleResponse;
      const pageUrl = this.buildPropertyUrl(property?.mlsNumber, property?.boardId);
      // POLSINELLO asked to report only Viewed Property, but experimentally removing Visited Open House for all clients
      // const hasOpenHouse = !!property.openHouse && !!Object.values(property.openHouse).find(openHouse => openHouse["date"]); // perhaps a helper function? not sure about location

      return {
         ...defaults,
         type: 'Viewed Property',
         pageUrl,
         property: this.mapRplPropertyToBoss(property),
         pageReferrer: defaults.pageReferrer || pageUrl
      };
   };
}