import { injectable } from "tsyringe";
import RepliersBase, { ApiResponse } from "./base.js";
import { RplListingsSingle } from "./listings.js";
import _debug from "debug";
const debug = _debug("repliers:services:repliers:normalize");
export type RplListingsSingleRETS = RplListingsSingle;
export interface NormalizedData {
   // ModificationTimestamp: string; // updatedOn ????
   // ListingContractDate: string; // listDate

   // City: string; //address.city
   // StreetDirSuffix: string; // address.streetDirection
   // StreetName: string; // address.streetName
   // StreetNumber: string; // address.streetNumber
   // StreetSuffix: string; // address.streetSuffix
   // PostalCode: string; // address.zip

   LotSizeUnits: string; // lot.measurement ????
   FrontageLength: string; // lot.width ????
   LotDepth: string; // lot.depth

   TaxAnnualAmount: number; // taxes.annualAmount

   // AssociationFeeIncludes: string[]; // ????
   // AssociationAmenities: string[]; // condominium.ammenities
   AssociationFee: number; // condominium.fees.maintenance ?????
   PetsAllowed: string; // condominium.pets
   // DirectionFaces: string; // condominium.exposure ????

   PropertySubType: string; //  details.style ?????
   BathroomsFull: number; // details.numBathrooms
   PropertyType: string; // details.propertyType
   GarageSpaces: number; // details.numGarageSpaces
   ParkingTotal: number; // details.numParkingSpaces
   BedroomsTotal: number; // details.numBedrooms
   PoolFeatures: string[]; // details.swimmingPool ????
   ConstructionMaterials: string[]; // details.exteriorConstruction1, details.exteriorConstruction2
   Basement: string[]; // details.basement1,details.basement2
   Heating: string[]; // details.heating
   YearBuilt: string; // details.yearBuilt
   AboveGradeFinishedArea: number; // detrails.sqft
   // FireplaceYN: string; // details.numFireplaces ?????

   // Appliances: string[]; // ????
   // InteriorFeatures: string[]; // ????
   // BedroomsPossible: number; // ????
   // ParkingFeatures: string[]; // ????

   // YearBuiltDetails: string; // ????
}
export interface NormalizeResponse extends ApiResponse {
   value: NormalizedData[];
}
@injectable()
export default class RepliersNormalize extends RepliersBase {
   public async normalizeRETS(listings: RplListingsSingleRETS[]) {
      return this.request<NormalizeResponse>("POST", `/property/normalize`, undefined, {
         listings
      });
   }
   public mapNormalizedData(data: NormalizedData, listing: RplListingsSingleRETS): RplListingsSingle {
      debug("[mapNormalizedData] listing: %O", listing);
      debug("[mapNormalizedData] normalized data: %O", data);
      const details = {
         ...listing.details,
         basement1: data.Basement ? data.Basement.join(",") : null,
         basement2: null,
         exteriorConstruction1: data.ConstructionMaterials ? data.ConstructionMaterials.join(",") : null,
         exteriorConstruction2: null,
         heating: data.Heating ? data.Heating.join(",") : null,
         swimmingPool: data.PoolFeatures ? data.PoolFeatures.join(",") : null,
         numBathrooms: data.BathroomsFull,
         numBedrooms: data.BedroomsTotal,
         numGarageSpaces: data.GarageSpaces,
         numParkingSpaces: data.ParkingTotal,
         propertyType: data.PropertyType,
         style: data.PropertySubType,
         sqft: data.AboveGradeFinishedArea
      };
      const lot = {
         ...listing.lot,
         measurement: data.LotSizeUnits,
         width: data.FrontageLength,
         depth: data.LotDepth
      };
      const condominium = listing.condominium ? {
         ...listing.condominium,
         pets: data.PetsAllowed,
         fees: {
            ...listing.condominium.fees,
            maintenance: data.AssociationFee
         }
      } : undefined;
      const mappedData = {
         ...listing,
         lot,
         details,
         condominium
      };
      debug("[mapNormalizedData] mappedData: %O", mappedData);
      return mappedData;
   }
}