export enum RplAggregates {
   class = "class",
   status = "status",
   lastStatus = "lastStatus",
   type = "type",
   "address.area" = "address.area",
   "address.city" = "address.city",
   "address.neighborhood" = "address.neighborhood",
   "details.propertyType" = "details.propertyType",
   "details.style" = "details.style",
   "detail.numBedrooms" = "detail.numBedrooms",
   "details.numBathrooms" = "details.numBathrooms",
   "permissions.displayPublic" = "permissions.displayPublic",
   "details.businessType" = "details.businessType",
   "details.businessSubType" = "details.businessSubType",
   "details.basement1" = "details.basement1",
   "details.basement2" = "details.basement2",
   "details.garage" = "details.garage",
   "details.den" = "details.den",
   "details.sewer" = "details.sewer",
   "details.waterSource" = "details.waterSource",
   "details.heating" = "details.heating",
   "details.swimmingPool" = "details.swimmingPool",
   "details.yearBuilt" = "details.yearBuilt",
   "details.exteriorConstruction" = "details.exteriorConstruction",
   "details.sqft" = "details.sqft",
   "details.balcony" = "details.balcony",
   "condominium.locker" = "condominium.locker",
   "details.driveway" = "details.driveway",
   map = "map",
   "address.zip" = "address.zip",
}
export type RplDateFormat = `${number}-${number}-${number}`; // YYYY-MM-DD
export type RplMonthFormat = `${number}-${number}`; // YYYY-MM
export type RplYearFormat = `${number}`; // YYYY

export const RplDateFormatter = "YYYY-MM-DD";
export enum RplYesNo {
   Y = "Y",
   N = "N",
}
export enum RplClass {
   condo = "condo",
   residential = "residential",
   commercial = "commercial",
}
export enum RplListingClass {
   ResidentialProperty = "ResidentialProperty",
   CondoProperty = "CondoProperty",
   CommercialProperty = "CommercialProperty",
}
export enum RplLastStatus {
   Sus = "Sus",
   Exp = "Exp",
   Sld = "Sld",
   Ter = "Ter",
   Dft = "Dft",
   Lsd = "Lsd",
   Sc = "Sc",
   Sce = "Sce",
   Lc = "Lc",
   Pc = "Pc",
   Ext = "Ext",
   New = "New",
}
export enum RplOperator {
   AND = "AND",
   OR = "OR",
}

/**
* @openapi
*  components:
*     schemas:
*        RplSimilarSortBy:
*           type: string
*           enum: [updatedOnDesc, updatedOnAsc, createdOnAsc, createdOnDesc]
*/
export enum RplSimilarSortBy {
   "updatedOnDesc" = "updatedOnDesc",
   "updatedOnAsc" = "updatedOnAsc",
   "createdOnAsc" = "createdOnAsc",
   "createdOnDesc" = "createdOnDesc",
}
export enum RplSortBy {
   "createdOnDesc" = "createdOnDesc",
   "updatedOnDesc" = "updatedOnDesc",
   "createdOnAsc" = "createdOnAsc",
   "distanceAsc" = "distanceAsc",
   "distanceDesc" = "distanceDesc",
   "updatedOnAsc" = "updatedOnAsc",
   "soldDateAsc" = "soldDateAsc",
   "soldDateDesc" = "soldDateDesc",
   "soldPriceAsc" = "soldPriceAsc",
   "soldPriceDesc" = "soldPriceDesc",
   "sqftAsc" = "sqftAsc",
   "sqftDesc" = "sqftDesc",
   "listPriceAsc" = "listPriceAsc",
   "listPriceDesc" = "listPriceDesc",
   "bedsAsc" = "bedsAsc",
   "bedsDesc" = "bedsDesc",
   "bathsDesc" = "bathsDesc",
   "bathsAsc" = "bathsAsc",
   "yearBuiltDesc" = "yearBuiltDesc",
   "yearBuiltAsc" = "yearBuiltAsc",
   "random" = "random",
   statusAscListDateAsc = "statusAscListDateAsc",
   statusAscListDateDesc = "statusAscListDateDesc",
   statusAscListPriceAsc = "statusAscListPriceAsc",
   statusAscListPriceDesc = "statusAscListPriceDesc",
   qualityAsc = "qualityAsc",
   qualityDesc = "qualityDesc",
}
export enum RplStatistics {
   "avg-daysOnMarket" = "avg-daysOnMarket",
   "sum-daysOnMarket" = "sum-daysOnMarket",
   "min-daysOnMarket" = "min-daysOnMarket",
   "max-daysOnMarket" = "max-daysOnMarket",
   "avg-listPrice" = "avg-listPrice",
   "sum-listPrice" = "sum-listPrice",
   "min-listPrice" = "min-listPrice",
   "max-listPrice" = "max-listPrice",
   "avg-soldPrice" = "avg-soldPrice",
   "sum-soldPrice" = "sum-soldPrice",
   "min-soldPrice" = "min-soldPrice",
   "max-soldPrice" = "max-soldPrice",
   "cnt-new" = "cnt-new",
   "cnt-closed" = "cnt-closed",
   "med-listPrice" = "med-listPrice",
   "med-soldPrice" = "med-soldPrice",
   "med-daysOnMarket" = "med-daysOnMarket",
   "sd-listPrice" = "sd-listPrice",
   "sd-soldPrice" = "sd-soldPrice",
   "sd-daysOnMarket" = "sd-daysOnMarket",
   "avg-priceSqft" = "avg-priceSqft",
   "grp-mth" = "grp-mth",
   "grp-yr" = "grp-yr",
}
export enum RplStatus {
   A = "A",
   U = "U",
}
export enum RplType {
   Sale = "sale",
   Lease = "lease",
}
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;