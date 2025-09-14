import { container, inject, injectable } from "tsyringe";
import RepliersService from "./repliers.js";
import type { RplListingsCountDto, RplListingsLocationsDto, RplListingsSearchDto, RplListingsSimilarDto, RplListingsSingleDto, RplNlpDto } from "../validate/listings.js";
import { RplArea, RplCity, RplListingsLocationsResponse, RplListingsSingleResponse, RplNeighborhood } from "./repliers/listings.js";
import { RplClass, RplYesNo } from "../types/repliers.js";
import _debug from "debug";
import cached, { Cached } from "../lib/decorators/cached.js";
import { type AppConfig } from "../config.js";
import { scrubbed } from "./scrubber/listings.js";
import { ApiError } from "../lib/errors.js";
const config = container.resolve<AppConfig>("config");
const debug = _debug("repliers:services:listings");

// HELPERS
const allowedAreas = (areas: RplArea[]) => config.settings.locations.allow_all_areas ? areas : areas.filter(area => config.settings.locations.allowed_areas.includes(area.name.toLowerCase()));
const locationClassIdx = (locations: RplListingsLocationsResponse, rplClass: RplClass) => locations.boards[0].classes.findIndex(cls => cls.name === rplClass);
const locationAreas = (locations: RplListingsLocationsResponse, rplClass: RplClass) => locations.boards[0].classes[locationClassIdx(locations, rplClass)]!.areas;
@injectable()
export default class ListingsService {
   constructor(private repliers: RepliersService, @inject("config")
   private config: AppConfig) {}
   private ensureRequiredFields(params: {
      fields?: string;
   }) {
      let {
         fields = ""
      } = params;
      const fieldsArr = fields.split(",");
      fieldsArr.push("status", "permissions", "address", "duplicates", "boardId");
      fields = [...new Set(fieldsArr)].join(",");
      params.fields = fields;
      return params;
   }
   @scrubbed("listings")
   async search(params: RplListingsSearchDto) {
      const {
         app_state: _state,
         ...rplParams
      } = params;
      rplParams.displayInternetEntireListing = RplYesNo.Y;
      this.ensureRequiredFields(rplParams);
      const results = await this.repliers.listings.search({
         ...rplParams
      }, true);
      return results;

      // REMOVED this hack as we crashed on it at times
      // // this is a hack to remove statistics for listings that are not in the requested timeframe
      // return this.ensureStatisticsCorrect(results, params);
   }
   @cached("listings:count", config.cache.listingscount.ttl_ms)
   async count(params: RplListingsCountDto) {
      this.ensureRequiredFields(params);
      return await this.repliers.listings.search({
         ...params,
         listings: false
      }, true);
   }

   // REMOVED this hack as we crashed on it at times
   // private ensureStatisticsCorrect(results: RplListingsSearchResponse, requestParams: RplListingsSearchDto) {
   //    if (
   //       "statistics" in results &&
   //       "daysOnMarket" in results.statistics &&
   //       "mth" in results.statistics.daysOnMarket &&
   //       "minListDate" in requestParams
   //    ) {
   //       Object.keys(results.statistics.daysOnMarket.mth).forEach((date) => {
   //          if (dayjs(date, "YYYY-MM").isBefore(dayjs(requestParams.minListDate, "YYYY-MM-DD"))) {
   //             delete results.statistics.daysOnMarket.mth[date];
   //          }
   //       });
   //    }
   //    return results;
   // }

   @scrubbed("similar")
   async similar(params: RplListingsSimilarDto) {
      this.ensureRequiredFields(params);
      return this.repliers.listings.similar({
         ...params
      });
   }
   @scrubbed()
   async single(params: RplListingsSingleDto) {
      const listing = await this.repliers.listings.single({
         ...params
      });
      this.validateAvailability(listing);
      return listing;
   }
   private validateAvailability(listing: RplListingsSingleResponse) {
      const hiddenStatuses = this.config.settings.hide_unavailable_listings_statuses;
      const statusCode = this.config.settings.hide_unavailable_listings_http_code;
      const status = listing.lastStatus;
      if (hiddenStatuses.includes(status)) {
         debug(`[ListingsService: single]: %0 has status %1 and cannot be returned. HiddenStatuses are %2`, listing.mlsNumber, status, hiddenStatuses);
         throw new ApiError(`Not found. ${status}`, statusCode);
      }
   }
   private areaExist(area_name: string, residentalAreas: RplArea[]) {
      return residentalAreas.find(area => area.name === area_name);
   }
   private cityExist(area_name: string, city_name: string, residentalAreas: RplArea[]) {
      const areaIdx = residentalAreas.findIndex(area => area.name === area_name);
      return residentalAreas[areaIdx]?.cities.find(city => city.name === city_name);
   }
   private neighborhoodExist(area_name: string, city_name: string, neighborhood_name: string, residentalAreas: RplArea[]) {
      const area = residentalAreas.find(area => area.name === area_name);
      const city = area?.cities.find(city => city.name === city_name);
      return city?.neighborhoods.find(neighborhood => neighborhood.name === neighborhood_name);
   }
   private copyArea(area: RplArea, residentalAreas: RplArea[]) {
      residentalAreas.push(area);
   }
   private copyCity(area_name: string, city: RplCity, residentalAreas: RplArea[]) {
      const areaIdx = residentalAreas.findIndex(area => area.name === area_name);
      residentalAreas[areaIdx]?.cities.push(city);
   }
   private copyNeighborhood(area_name: string, city_name: string, neighborhood: RplNeighborhood, residentalAreas: RplArea[]) {
      const areaIdx = residentalAreas.findIndex(area => area.name === area_name);
      if (areaIdx === undefined) {
         return;
      }
      const cityIdx = residentalAreas[areaIdx]?.cities.findIndex(city => city.name === city_name);
      if (cityIdx === undefined) {
         return;
      }
      neighborhood.coordinates = null;
      debug("Copy neighborhood, area: %s, city: %s, neighborhood: %o ", area_name, city_name, neighborhood);
      residentalAreas[areaIdx]?.cities[cityIdx]?.neighborhoods.push(neighborhood);
   }

   // by ref
   private removeEmptyNeighborhoods(neighborhoods: Array<RplNeighborhood>, limit: number = 0) {
      for (let hoodIdx = 0; hoodIdx < neighborhoods.length; hoodIdx++) {
         const hood = neighborhoods[hoodIdx]!;
         if (hood.activeCount <= limit) {
            debug("removing hood: %s", hood.name);
            neighborhoods.splice(hoodIdx, 1);
            hoodIdx -= 1;
         }
      }
   }
   private removeEmptyCities(cities: Array<RplCity>, limit: number = 0) {
      for (let cityIdx = 0; cityIdx < cities.length; cityIdx++) {
         const city = cities[cityIdx]!;
         if (city.activeCount <= limit) {
            // debug("removing city: %s", city.name);
            cities.splice(cityIdx, 1);
            cityIdx -= 1;
            continue;
         }
         this.removeEmptyNeighborhoods(city.neighborhoods, limit);

         // Drop city based only if it had only activeCount === 0 hoods
         if (limit === 0) {
            if (0 == city.neighborhoods.length) {
               cities.splice(cityIdx, 1);
               cityIdx -= 1;
            }
         }
      }
   }

   // by ref
   private removeEmptyLocations(locations: RplListingsLocationsResponse, limit: number = 0) {
      const residentalIdx = locations.boards[0].classes.findIndex(cls => cls.name === RplClass.residential);
      const residentalAreas = locations.boards[0].classes[residentalIdx]!.areas;
      for (let areaIdx = 0; areaIdx < residentalAreas.length; areaIdx++) {
         const area = residentalAreas[areaIdx]!;
         this.removeEmptyCities(area.cities, limit);
         if (0 == area.cities.length) {
            residentalAreas.splice(areaIdx, 1);
            areaIdx -= 1;
         }
      }
   }

   // by ref
   private removeCoordinates(locations: RplListingsLocationsResponse) {
      const residentalAreas = locationAreas(locations, RplClass.residential);
      for (let areaIdx = 0; areaIdx < residentalAreas.length; areaIdx++) {
         const area = residentalAreas[areaIdx]!;
         if (area.cities.length === 0) continue;
         for (let cityIdx = 0; cityIdx < area.cities.length; cityIdx++) {
            const city = area.cities[cityIdx]!;
            city.coordinates = null;
            if (city.neighborhoods.length === 0) continue;
            for (let hoodIdx = 0; hoodIdx < city.neighborhoods.length; hoodIdx++) {
               const hood = city.neighborhoods[hoodIdx]!;
               hood.coordinates = null;
            }
         }
      }
   }

   // by ref
   private removeExtraBoards(locations: RplListingsLocationsResponse) {
      const boards = locations.boards;
      for (let boardIdx = 0; boardIdx < boards.length; boardIdx++) {
         if (boards[boardIdx]!.boardId !== config.settings.locations.boardId) {
            boards.splice(boardIdx, 1);
            boardIdx -= 1;
         }
      }
   }

   // by ref
   private removeExtraAreas(locations: RplListingsLocationsResponse, cls: number) {
      if (config.settings.locations.allow_all_areas) return;
      const areas = locations.boards[0].classes[cls]!.areas;
      for (let areaIdx = 0; areaIdx < areas.length; areaIdx++) {
         const area = areas[areaIdx]!;
         if (!config.settings.locations.allowed_areas.includes(area.name.toLowerCase())) {
            areas.splice(areaIdx, 1);
            areaIdx -= 1;
         }
      }
   }
   @cached("autosuggest:locations", config.cache.statswidget.ttl_ms)
   async locations(params: RplListingsLocationsDto): Promise<RplListingsLocationsResponse | Cached<RplListingsLocationsResponse>> {
      const {
         dropCoordinates,
         ...repliersParams
      } = params;
      const locations = await this.repliers.listings.locations({
         ...repliersParams
      });
      if (!locations.boards.length) {
         return locations;
      }
      this.removeExtraBoards(locations);

      // by ref
      const allCondoAreas = -1 < locationClassIdx(locations, RplClass.condo) ? locationAreas(locations, RplClass.condo) : [];
      const allResidentalAreas = -1 < locationClassIdx(locations, RplClass.residential) ? locationAreas(locations, RplClass.residential) : [];
      if (!allCondoAreas.length || !allResidentalAreas.length) {
         return locations;
      }
      const condoAreas = allowedAreas(allCondoAreas);
      const residentalAreas = allowedAreas(allResidentalAreas);
      for (const area of condoAreas) {
         if (this.areaExist(area.name, residentalAreas)) {
            debug("Area exist: %s", area.name);
            for (const city of area.cities) {
               if (this.cityExist(area.name, city.name, residentalAreas)) {
                  debug("City exist: %s, area: %s", city.name, area.name);
                  for (const neighborhood of city.neighborhoods) {
                     if (!this.neighborhoodExist(area.name, city.name, neighborhood.name, residentalAreas)) {
                        this.copyNeighborhood(area.name, city.name, neighborhood, residentalAreas);
                     }
                  }
               } else {
                  debug("City not exist: %s, area: %s", city.name, area.name);
                  this.copyCity(area.name, city, residentalAreas);
               }
            }
         } else {
            debug("Area not exist: %s", area.name);
            this.copyArea(area, residentalAreas);
         }
      }

      // drop condos class
      if (-1 < locationClassIdx(locations, RplClass.condo)) {
         locations.boards[0].classes.splice(locationClassIdx(locations, RplClass.condo), 1);
      }

      // drop extra areas

      if (-1 < locationClassIdx(locations, RplClass.residential)) {
         this.removeExtraAreas(locations, locationClassIdx(locations, RplClass.residential));
      }
      this.removeEmptyLocations(locations, params.activeCountLimit);
      if (dropCoordinates) {
         this.removeCoordinates(locations);
      }
      return locations;
   }
   async nlp(params: RplNlpDto) {
      const result = await this.repliers.listings.nlp({
         ...params
      });
      if ("request" in result && "url" in result.request) {
         const params = new URL(result.request.url).searchParams;
         delete result.request.url;
         result.request.params = Object.fromEntries(params);
      }
      return result;
   }
}