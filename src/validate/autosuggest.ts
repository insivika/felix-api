import joi from "joi";
import config from "../config.js";

// Base interface with common properties
export interface BaseAutosuggestDto {
   q: string;
   lat: string;
   long: string;
   /**
    * @deprecated Use new {@link searchSession} field instead.
    */
   mapboxSearchSession: string;
   searchSession: string;
}

// Derived interfaces
export interface AutosuggestDto extends BaseAutosuggestDto {
   resultsPerPage: number;
}
export interface AutosuggestAddressDto extends BaseAutosuggestDto {
   radius: number;
}

// Base schema for common properties
const baseAutosuggestSchema = {
   lat: joi.string().regex(/^(-?\d+(\.\d+)?)$/).default(config.repliers.autosuggest.lat),
   long: joi.string().regex(/^(-?\d+(\.\d+)?)$/).default(config.repliers.autosuggest.long),
   mapboxSearchSession: joi.string().uuid(),
   searchSession: joi.string().uuid()
};
export const autosuggestSchema = joi.object<AutosuggestDto>().keys({
   ...baseAutosuggestSchema,
   q: joi.string().min(3),
   resultsPerPage: joi.number().positive().max(config.repliers.autosuggest.max_results).default(config.repliers.autosuggest.max_results_default)
}).or('mapboxSearchSession', 'searchSession');
export const autosuggestAddressSchema = joi.object<AutosuggestAddressDto>().keys({
   ...baseAutosuggestSchema,
   q: joi.string().min(1),
   radius: joi.number().positive().default(config.repliers.autosuggest.radius)
}).or('mapboxSearchSession', 'searchSession');