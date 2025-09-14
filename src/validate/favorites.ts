import joi from "joi";
import { RplFavoritesAddDto } from "../services/repliers/favorites.js";
import { mlsNumberSchema } from "./common.js";
export const favoritesDeleteSchema = joi.object<FavoritesDeleteDto>().keys({
   favoriteId: joi.number().positive().required(),
   clientId: joi.number()
});
export interface FavoritesDeleteDto {
   favoriteId: number;
   clientId: number;
}
export const favoritesCreateSchema = joi.object<RplFavoritesAddDto>().keys({
   boardId: joi.number().positive(),
   clientId: joi.number().positive().required(),
   mlsNumber: mlsNumberSchema.required()
});