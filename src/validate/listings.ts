import joi from "joi";
import { RplAggregates, RplClass, RplDateFormat, RplLastStatus, RplOperator, RplSimilarSortBy, RplSortBy, RplStatus, RplType, RplYesNo } from "../types/repliers.js";
import { appStateSchema, csvFieldValidator, dateSchema, mlsNumberSchema, rplLastStatus, rplOperatorSchema, rplSortBySchema, rplStatisticsSchema, rplStatusSchema, rplTypeSchema, rplYesNoSchema, stringArraySchema, userSchema } from "./common.js";
import config from "../config.js";
import _ from "lodash";
export interface RplListingsAppState {
   user: Record<string, unknown>;
}
export interface RplListingsSearchDto {
   agent?: string[];
   aggregates?: RplAggregates[];
   aggregateStatistics?: boolean;
   amenities?: string[];
   area?: string[];
   balcony?: string[];
   basement?: string[];
   bathroomQuality?: string | string[];
   bedroomQuality?: string | string[];
   boardId?: number[];
   brokerage?: string;
   businessSubType?: string[];
   businessType?: string[];
   city?: string[];
   class?: RplClass[];
   cluster?: boolean;
   clusterFields?: string;
   clusterLimit?: number;
   clusterPrecision?: number;
   clusterStatistics?: boolean;
   cooling?: string;
   coverImage?: string;
   den?: string;
   diningRoomQuality?: string | string[];
   displayAddressOnInternet?: RplYesNo;
   displayInternetEntireListing?: RplYesNo;
   displayPublic?: RplYesNo;
   district?: number[] | string[];
   driveway?: string[];
   exteriorConstruction?: string[];
   fields?: string;
   frontOfStructureQuality?: string | string[];
   garage?: string[];
   hasAgents?: boolean;
   hasImages?: boolean;
   heating?: string[];
   kitchenQuality?: string | string[];
   lastStatus?: RplLastStatus[];
   lat?: string;
   livingRoomQuality?: string | string[];
   listDate?: RplDateFormat;
   listings?: boolean;
   locker?: string[];
   long?: string;
   map?: [number, number][][];
   mapOperator?: RplOperator;
   maxBaths?: number;
   maxBeds?: number;
   maxBedsPlus?: number;
   maxKitchens?: number;
   maxListDate?: string;
   maxMaintenanceFee?: number;
   maxOpenHouseDate?: RplDateFormat;
   maxPrice?: number;
   maxQuality?: number;
   maxRepliersUpdatedOn?: RplDateFormat;
   maxSoldDate?: RplDateFormat;
   maxSoldPrice?: number;
   maxSqft?: number;
   maxTaxes?: number;
   maxUnavailableDate?: RplDateFormat;
   maxUpdatedOn?: RplDateFormat;
   maxYearBuilt?: number;
   minBaths?: number;
   minBeds?: number;
   minBedsPlus?: number;
   minGarageSpaces?: number;
   minKitchens?: number;
   minListDate?: RplDateFormat;
   minOpenHouseDate?: RplDateFormat;
   minParkingSpaces?: number;
   minPrice?: number;
   minQuality?: number;
   minRepliersUpdatedOn?: RplDateFormat;
   minSoldDate?: RplDateFormat;
   minSoldPrice?: number; // string in docs
   minSqft?: number;
   minUnavailableDate?: RplDateFormat;
   minUpdatedOn?: RplDateFormat;
   minYearBuilt?: RplDateFormat;
   mlsNumber?: string[];
   neighborhood?: string[];
   officeId?: string;
   operator?: RplOperator;
   overallQuality?: string | string[];
   pageNum?: number;
   propertyType?: string;
   radius?: number;
   resultsPerPage?: number;
   search?: string;
   searchFields?: string;
   sortBy?: RplSortBy;
   sqft?: string[];
   statistics?: string;
   status?: RplStatus[];
   streetDirection?: string; // W in examples, maybe enum with N, E, W, S?
   streetName?: string;
   streetNumber?: string;
   style?: string[];
   swimmingPool?: string[];
   type?: RplType[];
   unitNumber?: string;
   updatedOn?: RplDateFormat;
   waterSource?: string[];
   repliersUpdatedOn?: RplDateFormat;
   sewer?: string[];
   state?: string;
   streetSuffix?: string;
   waterfront?: RplYesNo;
   yearBuilt?: string[];
   zip?: string;
   zoning?: string;
   body?: {
      imageSearchItems?: RplImageSearchItem[];
   };
   app_state: RplListingsAppState;
   ["raw.featured"]?: string;
}
const listingsCountOmittedFields = ["fields", "app_state", "listings", "resultsPerPage", "pageNum", "sortBy", "app_state"];
export interface RplListingsCountDto extends Omit<RplListingsSearchDto, (typeof listingsCountOmittedFields)[number]> {}
const listingSearchSchemaKeys = {
   app_state: appStateSchema,
   agent: stringArraySchema,
   aggregates: joi.string(),
   aggregateStatistics: joi.boolean(),
   amenities: stringArraySchema,
   area: stringArraySchema,
   balcony: stringArraySchema,
   basement: stringArraySchema,
   bathroomQuality: stringArraySchema,
   bedroomQuality: stringArraySchema,
   boardId: joi.array().items(joi.number()).single().default(config.settings.defaults.boardId),
   brokerage: joi.string().max(70),
   businessSubType: stringArraySchema,
   businessType: stringArraySchema,
   city: stringArraySchema,
   class: joi.array().items(joi.string().valid(...Object.keys(RplClass))).single(),
   cluster: joi.boolean(),
   clusterFields: joi.string(),
   clusterLimit: joi.when("aggregates", {
      is: joi.string().valid(RplAggregates.map).required(),
      then: joi.number().min(1).max(200).optional(),
      otherwise: joi.forbidden()
   }),
   clusterPrecision: joi.when("aggregates", {
      is: joi.string().valid(RplAggregates.map).required(),
      then: joi.number().min(1).max(29).optional(),
      otherwise: joi.forbidden()
   }),
   clusterStatistics: joi.boolean(),
   coverImage: joi.string().max(20),
   cooling: joi.string().max(20),
   den: joi.string().max(20),
   displayAddressOnInternet: rplYesNoSchema,
   displayInternetEntireListing: rplYesNoSchema,
   displayPublic: rplYesNoSchema,
   district: joi.array().items(joi.number().integer()).single(),
   diningRoomQuality: stringArraySchema,
   driveway: stringArraySchema,
   exteriorConstruction: stringArraySchema,
   fields: joi.string(),
   frontOfStructureQuality: stringArraySchema,
   garage: stringArraySchema,
   hasAgents: joi.bool(),
   hasImages: joi.bool(),
   heating: stringArraySchema,
   kitchenQuality: stringArraySchema,
   lastStatus: rplLastStatus,
   lat: joi.string(),
   listDate: dateSchema,
   listings: joi.bool(),
   livingRoomQuality: stringArraySchema,
   locker: stringArraySchema,
   long: joi.string(),
   map: joi.alternatives(joi.array().items(joi.array().items(joi.array().length(2).items(joi.number()))), joi.string()),
   mapOperator: rplOperatorSchema,
   maxBaths: joi.number().positive().integer(),
   maxBeds: joi.number().positive().integer(),
   maxBedsPlus: joi.number().positive().integer(),
   maxKitchens: joi.number().positive().integer(),
   maxListDate: dateSchema,
   maxMaintenanceFee: joi.number().positive().integer(),
   maxOpenHouseDate: dateSchema,
   maxPrice: joi.number().positive().integer(),
   maxQuality: joi.number().positive(),
   maxRepliersUpdatedOn: dateSchema,
   maxSoldDate: dateSchema,
   maxSoldPrice: joi.number().positive().integer(),
   maxSqft: joi.number().positive().integer(),
   maxTaxes: joi.number().positive().integer(),
   maxUnavailableDate: dateSchema,
   maxUpdatedOn: dateSchema,
   maxYearBuilt: joi.number().positive().integer(),
   minBaths: joi.number().positive().integer(),
   minBeds: joi.number().positive().integer(),
   minBedsPlus: joi.number().positive().integer(),
   minGarageSpaces: joi.number().positive().integer(),
   minKitchens: joi.number().positive().integer(),
   minListDate: dateSchema,
   minOpenHouseDate: dateSchema,
   minParkingSpaces: joi.number().positive().integer(),
   minPrice: joi.number().positive().integer(),
   minQuality: joi.number().positive().allow(0),
   minRepliersUpdatedOn: dateSchema,
   minSoldDate: dateSchema,
   minSoldPrice: joi.number().positive().integer(),
   minSqft: joi.number().positive().integer(),
   minUnavailableDate: dateSchema,
   minUpdatedOn: dateSchema,
   minYearBuilt: joi.number().positive().integer(),
   mlsNumber: joi.array().items(mlsNumberSchema).single(),
   neighborhood: stringArraySchema,
   officeId: joi.string(),
   operator: rplOperatorSchema,
   overallQuality: stringArraySchema,
   pageNum: joi.number().positive().integer(),
   propertyType: stringArraySchema,
   radius: joi.number().positive().integer(),
   resultsPerPage: joi.number().positive().integer(),
   search: joi.string(),
   searchFields: joi.string(),
   sortBy: rplSortBySchema,
   sqft: stringArraySchema,
   statistics: rplStatisticsSchema,
   //rplStatistics,
   status: rplStatusSchema,
   streetDirection: joi.string(),
   streetName: joi.string(),
   streetNumber: joi.string(),
   style: stringArraySchema,
   swimmingPool: stringArraySchema,
   type: rplTypeSchema,
   unitNumber: joi.string(),
   updatedOn: dateSchema,
   waterSource: stringArraySchema,
   repliersUpdatedOn: dateSchema,
   sewer: stringArraySchema,
   state: joi.string(),
   streetSuffix: joi.string(),
   waterfront: rplYesNoSchema,
   yearBuilt: stringArraySchema,
   ["raw.featured"]: joi.string(),
   body: joi.object().keys({
      imageSearchItems: joi.array().items(joi.object().keys({
         type: joi.string().required(),
         value: joi.string(),
         url: joi.string(),
         boost: joi.number().sign("positive").required()
      }).or("value", "url")).min(1)
   })
};
export const listingSearchSchema = joi.object<RplListingsSearchDto>().keys(listingSearchSchemaKeys).with("radius", ["long", "lat"]);
// .with("radius", "state.user"); //Example: require "radius" for authorized users;

const listingCountSchemaKeys = _.omit(listingSearchSchemaKeys, listingsCountOmittedFields);
export const listingCountSchema = joi.object<RplListingsCountDto>().keys(listingCountSchemaKeys);
export interface RplImageSearchItemBase {
   type: string;
   boost: number;
}
export interface RplImageSearchValue extends RplImageSearchItemBase {
   type: "text";
   value: string;
}
export interface RplImageSearchUrl extends RplImageSearchItemBase {
   type: "image";
   url: string;
}
export type RplImageSearchItem = RplImageSearchValue | RplImageSearchUrl;
export interface RplListingsSimilarDto {
   boardId?: number[];
   listPriceRange?: number;
   radius?: number;
   sortBy?: RplSimilarSortBy;
   propertyId: string;
   fields?: string;
   app_state: RplListingsAppState;
}
export const listingSimilarSchema = joi.object<RplListingsSimilarDto>().keys({
   boardId: joi.array().items(joi.number()).single().default(config.settings.defaults.boardId),
   listPriceRange: joi.number().positive().integer(),
   radius: joi.number().positive().integer(),
   sortBy: joi.string().valid(...Object.values(RplSimilarSortBy)),
   propertyId: joi.string(),
   fields: joi.string(),
   app_state: appStateSchema
});
export interface RplListingsLocationsDto {
   area?: string;
   city?: string;
   neighborhood?: string;
   class: RplClass[];
   boardId?: number;
   dropCoordinates: boolean;
   activeCountLimit?: number;
}
export const listingsLocationsSchema = joi.object<RplListingsLocationsDto>().keys({
   area: joi.string(),
   city: joi.string(),
   neighborhood: joi.string(),
   class: joi.array().items(joi.string().valid(...Object.keys(RplClass))),
   boardId: joi.number(),
   dropCoordinates: joi.boolean(),
   activeCountLimit: joi.number().default(5)
});
export const listingsSingleSchema = joi.object<RplListingsSingleDto>().keys({
   mlsNumber: mlsNumberSchema.required(),
   boardId: joi.number().required(),
   fields: csvFieldValidator(["raw", "reso"]),
   app_state: appStateSchema
});
export interface RplListingsSingleDto {
   mlsNumber?: string;
   boardId?: number;
   fields?: string;
   app_state?: RplListingsAppState;
}
export const nlpSchema = joi.object<RplNlpDto>().keys({
   prompt: joi.string().required(),
   nlpId: joi.string(),
   state: joi.object().keys({
      user: userSchema
   })
});
export interface RplNlpDto {
   prompt: string;
   nlpId?: string;
   state: {
      user: Record<string, unknown>;
   };
}