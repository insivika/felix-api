import { injectable } from "tsyringe";
import RepliersService from "./repliers.js";
import { RplFavoritesAddDto } from "./repliers/favorites.js";
import { ApiError } from "../lib/errors.js";
@injectable()
export default class FavoritesService {
   constructor(private repliers: RepliersService) {}
   add(params: RplFavoritesAddDto) {
      return this.repliers.favorites.add({
         ...params
      });
   }
   get(clientId: number) {
      return this.repliers.favorites.get(clientId);
   }
   async delete(clientId: number, favoriteId: number) {
      const response = await this.get(clientId);
      const isOwned = response.favorites.find(fav => fav.favoriteId === favoriteId);
      if (isOwned === undefined) {
         throw new ApiError('You are not owner of that favoriteId', 400);
      }
      return this.repliers.favorites.delete(favoriteId);
   }
}