import { container } from "tsyringe";
import { RplListingsSingle } from "../../services/repliers/listings.js";
import { RplStatus, RplYesNo } from "../../types/repliers.js";
import BaseScrubber from "./base.js";
import _debug from "debug";
import { AppConfig } from "../../config.js";
import _ from "lodash";
const debug = _debug("repliers:scrubber:listings");
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export interface ScrubberFunctionParams {
   state: {
      user?: Record<string, unknown>;
   };
}
const DropFields = ["history", "agents", "raw"];
export type ImportantFields = "permissions" | "status" | "address" | "duplicates" | "boardId";
const config = container.resolve<AppConfig>('config');
const SafeFields = ["address", "class", "map", "propertyType", "type", "mlsNumber", "permissions", "status", "boardId", "listDate", "images", "openHouse", "imageInsights"];
const SafeAddressFields = ["area", "city", "streetDirection", "streetName", "streetDirectionPrefix", "district", "streetSuffix", "neighborhood", "state", "majorIntersection", "communityCode", "country"];
export class ListingsScrubber extends BaseScrubber {
   constructor(private args: any[] | [ScrubberFunctionParams, ...any[]]) {
      debug("Function call args: %O", args);
      super();
   }
   private asGuest(data: RequiredFields<Partial<RplListingsSingle>, ImportantFields>) {
      debug("Scrubbing as guest");
      debug("Data: %s, Dups: %O", data["mlsNumber"], data["duplicates"]);

      //TODO: Update tests to support this
      if (config.settings.scrubbing_duplicates_enabled && data["status"] === RplStatus.A && (
      // for all which have status = A AND
      !Array.isArray(data["duplicates"]) || !data["duplicates"].includes(config.settings.scrubbing_ref_board_id)) // ( if no duplicates or duplicates is array which doesn't have CREA_BOARD_RESOURCE_ID number )
      ) {
         data["permissions"].displayPublic = RplYesNo.N; // treat as disaplyPublic = N
      }
      if (data["status"] === RplStatus.U || data["permissions"].displayPublic === RplYesNo.N) {
         if ("address" in data) {
            data["address"] = this.objectScrubber(data["address"], SafeAddressFields);
         }
         data = this.objectScrubber(data, SafeFields);
         data = this.dropFields(data, DropFields);
      }
      if ("history" in data) {
         data.history = data.history.map(item => {
            if ("address" in item) {
               item["address"] = this.objectScrubber(item["address"], SafeAddressFields);
            }
            let result = this.objectScrubber(item, SafeFields);
            result = this.dropFields(result, DropFields);
            return result;
         });
      }
      return data;
   }
   private asUser(data: RequiredFields<Partial<RplListingsSingle>, ImportantFields>) {
      debug("Scrubbing as user");
      return data;
   }
   private asAnyone(data: RequiredFields<Partial<RplListingsSingle>, ImportantFields>) {
      debug("Scrubbing everything else");
      if ("comparables" in data) {
         debug("Have comparables");
         data.comparables = data.comparables.map(item => {
            const extendedItem = this.extend(item, ["permissions", "boardId"], data);
            extendedItem.status = this.mapLastStatus(item);
            debug('%o', extendedItem);
            return this.scrub(extendedItem);
         });
      }
      if (data["permissions"].displayAddressOnInternet === RplYesNo.N) {
         data["address"] = this.objectScrubber(data["address"], SafeAddressFields);
      }
      // if (data["permissions"].displayPublic === "N") {
      //    data = this.objectScrubber(data, SafeFields);
      //    data = this.dropFields(data, DropFields);
      // }
      return data;
   }
   extend(data: Partial<RplListingsSingle>, fields: Array<ImportantFields>, source: RequiredFields<Partial<RplListingsSingle>, ImportantFields>) {
      const copy = JSON.parse(JSON.stringify(data)); // Make full copy not reference
      const result: Record<string, unknown> = {};
      for (const field of fields) {
         result[field] = source[field];
      }
      return {
         ...copy,
         ...result
      } as unknown as RequiredFields<Partial<RplListingsSingle>, ImportantFields>;
   }
   public mapLastStatus(item: {
      status?: RplStatus;
      lastStatus?: string;
   }) {
      const {
         status,
         lastStatus
      } = item;
      if (status === RplStatus.A || lastStatus !== undefined && ['New', 'Sc', 'Sce', 'Lc', 'Pc', 'Ext', 'Lce', 'Dft'].includes(lastStatus)) {
         return RplStatus.A;
      }
      return RplStatus.U;
   }
   public scrub(data: RequiredFields<Partial<RplListingsSingle>, ImportantFields>): Partial<RplListingsSingle> {
      const clone = _.cloneDeep(data);

      // clone.permissions.displayPublic = RplYesNo.Y;
      // return clone;

      // force permission value - mainly for Demo purposes
      if (config.settings.scrubbing_force_display_public_yes) {
         clone.permissions.displayPublic = RplYesNo.Y;
      }
      // don't scrub if boardId is missing in settings list of boards
      if (!config.settings.scrubbing_board_ids.includes(clone.boardId)) {
         return clone;
      }
      let result;
      if (!this.args[0].app_state || this.args[0].app_state.user === undefined) {
         result = this.asGuest(clone);
      } else {
         result = this.asUser(clone);
      }
      return this.asAnyone(result);
   }
}
export const scrubbed = (key?: string) => {
   return (_target: any, memberName: string, propertyDescriptor: PropertyDescriptor) => {
      return {
         get() {
            // function may accept params with state or w/o state property
            const wrapperFn = (...args: any[] | [ScrubberFunctionParams, ...any[]]) => {
               return propertyDescriptor.value.apply(this, args).then((result: any) => {
                  let scrubbingArray = key ? result[key] : [result]; // single or array
                  const scrubber = new ListingsScrubber(args);
                  scrubbingArray = scrubbingArray || [];
                  const scrubbedData = scrubbingArray.map(scrubber.scrub.bind(scrubber));
                  return key ? {
                     ...result,
                     [key]: scrubbedData
                  } : scrubbedData.at(0);
               });
            };
            Object.defineProperty(this, memberName, {
               value: wrapperFn,
               configurable: true,
               writable: true
            });
            return wrapperFn;
         }
      };
   };
};