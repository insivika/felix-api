import { injectable } from "tsyringe";
import RepliersBase, { ApiRequest, ApiResponse } from "./base.js";
import { RplListingsLocationsDto, RplListingsSearchDto, RplListingsSimilarDto, RplListingsSingleDto, RplNlpDto } from "../../validate/listings.js";
import { RplClass, RplListingClass, RplMonthFormat, RplStatus, RplType, RplYearFormat, RplYesNo } from "../../types/repliers.js";
export interface RepliersCondominium {
   amenities: string[];
   fees: {
      maintenance: number | null;
      [key: string]: unknown;
   };
   pets: string | null;
   exposure: string | null;
   [key: string]: unknown;
}
export interface RplListingsSingle extends Record<string, unknown> {
   listDate: string;
   rooms: Record<string, unknown>[];
   timestamps: Record<string, string | null>;
   condominium: RepliersCondominium | undefined;
   taxes: {
      annualAmount: number;
      assessmentYear: number;
   };
   office: {
      brokerageName: string;
   };
   images: string[];
   type: RplType;
   nearby: Record<string, unknown>;
   photoCount: number;
   lot: Record<string, unknown>;
   mlsNumber: string;
   openHouse: Array<Record<string, unknown>>;
   permissions: {
      displayAddressOnInternet: RplYesNo;
      displayPublic: RplYesNo;
      displayInternetEntireListing: RplYesNo;
   };
   soldPrice: string; // 0.00
   details: Record<string, unknown>;
   class: RplListingClass; // ResidentialProperty
   propertyType: string;
   style: string;
   map: {
      latitude: string;
      point: string;
      longitude: string;
   };
   address: Record<string, unknown>;
   resource: string;
   updatedOn: string;
   daysOnMarket: number;
   agents: Array<{
      [key: string]: unknown;
      agentId: number;
   }>;
   coopCompensation: unknown | null;
   listPrice: string;
   lastStatus: string; // New
   status: RplStatus;
   boardId: number;
   comparables: Partial<RplListingsSingle>[];
   history: Partial<RplListingsSingle>[];
}
export type RplRollingPeriodName = "grp-30-days" | "grp-90-days" | "grp-365-days";
export interface StatsMoment {
   avg: number;
   med: number;
}
export interface StatsCount {
   count: number;
}
export interface StatsMomentCount extends StatsCount, StatsMoment {}
export interface StatsFull extends StatsMomentCount {
   sum: number;
}
export type StatsMomentSum = Omit<StatsFull, "count">;
export interface RplRollingPeriod {
   [key: string]: StatsMomentCount;
}
export interface RplListingsSearchRequest extends Omit<RplListingsSearchDto, "app_state">, ApiRequest {}
export interface RplListingsSearchResponse extends ApiResponse {
   page: number;
   numPages: number;
   pageSize: number;
   count: number;
   listings: Array<RplListingsSingle>;
   statistics: {
      soldPrice: {
         "grp-30-days": RplRollingPeriod;
         "grp-90-days": RplRollingPeriod;
         "grp-365-days": RplRollingPeriod;
         avg: number;
         med: number;
         sum: number;
         mth: Record<RplMonthFormat, StatsFull>;
      };
      daysOnMarket: {
         med: number;
         avg: number;
         mth: Record<RplMonthFormat, StatsMomentCount>;
      };
      tax: {
         med: number;
         avg: number;
         yr?: Record<RplYearFormat, StatsMomentCount>;
      };
      new: {
         count: number;
         mth: Record<RplMonthFormat, StatsCount>;
      };
   };
}
export interface RplListingsSimilarRequest extends RplListingsSimilarDto, ApiRequest {}
export interface RplListingsSimilarResponse extends ApiResponse {}
export interface RplListingsSingleRequest extends RplListingsSingleDto, ApiRequest {}
export interface RplListingsSingleResponse extends ApiResponse, RplListingsSingle {}
export interface RplListingsLocationsRequest extends Omit<RplListingsLocationsDto, "dropCoordinates">, ApiRequest {}
export interface RplLocation {
   lat: number;
   lng: number;
}
export type RplLocationCoordinates = Array<Array<[number, number]>> | null;
export interface RplNeighborhood {
   name: string;
   activeCount: number;
   location: RplLocation;
   coordinates?: RplLocationCoordinates;
}
export interface RplCity {
   name: string;
   activeCount: number;
   location: RplLocation;
   coordinates?: RplLocationCoordinates;
   neighborhoods: Array<RplNeighborhood>;
}
export interface RplArea {
   name: string;
   cities: Array<RplCity>;
}
export interface RplLocationClass<Name> {
   name: Name;
   areas: Array<RplArea>;
}
export interface RplMap {
   latitude: string;
   longitude: string;
   point: string;
}
export interface RplListingsLocationsResponse extends ApiResponse {
   boards: [{
      boardId: number;
      name: string;
      updatedOn: string;
      classes: [RplLocationClass<"condo">, RplLocationClass<"residential">];
   }];
}
export interface RplNlpResponse extends ApiResponse {
   request: {
      url?: string;
      params?: Record<string, string>;
      body: Record<string, unknown>;
      summary: string;
   };
   nlpId: string;
}
export const rplListingClassToRplClassMapper = {
   [RplListingClass.CondoProperty]: RplClass.condo,
   [RplListingClass.ResidentialProperty]: RplClass.residential,
   [RplListingClass.CommercialProperty]: RplClass.commercial
};
@injectable()
export default class RepliersListings extends RepliersBase {
   public search(params: RplListingsSearchRequest, usePost = false) {
      const {
         body = {},
         ...query
      } = params;
      return this.request<RplListingsSearchResponse>(usePost ? "POST" : "GET", "/listings", query, body);
   }
   public similar(params: RplListingsSimilarRequest) {
      const {
         propertyId,
         ...otherParams
      } = params;
      return this.request<RplListingsSimilarResponse>("GET", `/listings/${propertyId}/similar`, otherParams);
   }
   public locations(params: RplListingsLocationsRequest) {
      return this.request<RplListingsLocationsResponse>("GET", `/listings/locations`, params);
   }
   public single(params: RplListingsSingleDto) {
      const {
         mlsNumber,
         ...otherParams
      } = params;
      return this.request<RplListingsSingleResponse>("GET", `/listings/${mlsNumber}`, otherParams);
   }

   // Maybe extract to a separate service?
   public nlp(params: RplNlpDto) {
      return this.request<RplNlpResponse>("POST", `/nlp`, {}, {
         ...params
      });
   }
}