import joi from "joi";
import { AssetType, AssetTypesArray } from "../../repository/assets.js";
const assetsTypeSchema = joi.string().valid(...AssetTypesArray).required();
const assetsEmailSchema = joi.string().email().required();
export const userAssetsCreateSchema = joi.object<UserAssetsCreateDto>().keys({
   id: joi.string().required(),
   type: assetsTypeSchema,
   email: assetsEmailSchema
   // someField: joi.when('type', { is: 'some-type', then: .., otherwise: joi.forbidden() })
});
export interface UserAssetsCreateDto {
   id: string;
   type: AssetType;
   email: string;
   [key: string]: unknown;
}
export const userAssetsGetSchema = joi.object<UserAssetsGetDto>().keys({
   email: assetsEmailSchema,
   type: assetsTypeSchema
});
export interface UserAssetsGetDto {
   email: string;
   type: AssetType;
}
export const userAssetsRemoveSchema = joi.object<UserAssetsRemoveDto>().keys({
   id: joi.string().required(),
   email: joi.string().email().required(),
   type: assetsTypeSchema
});
export interface UserAssetsRemoveDto {
   id: string;
   email: string;
   type: AssetType;
}