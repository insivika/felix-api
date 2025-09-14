import { injectable } from "tsyringe";
import RepliersBase, { ApiRequest, ApiResponse } from "./base.js";
export interface RplFavoritesAddDto {
   clientId: number;
   mlsNumber: string;
   boardId?: number;
}
export interface RplFavoritesAddRequest extends RplFavoritesAddDto, ApiRequest {}
export interface RplFavoritesAddResponse extends ApiResponse {}
export interface RplFavoritesDeleteResponse extends ApiResponse {}
export interface RplFavoritesGetResponse extends ApiResponse {
   page: number;
   numPages: number;
   pageSize: number;
   count: number;
   favorites: Array<{
      [key: string]: unknown;
      favoriteId: number;
   }>;
}
@injectable()
export default class RepliersFavorites extends RepliersBase {
   add(params: RplFavoritesAddRequest) {
      return this.request<RplFavoritesAddResponse>("POST", `/favorites`, {}, params);
   }
   delete(favoriteId: number) {
      return this.request<RplFavoritesDeleteResponse>("DELETE", `/favorites/${favoriteId}`);
   }

   // @scrubbed("favorites")
   get(clientId: number) {
      return this.request<RplFavoritesGetResponse>("GET", `/favorites`, {
         clientId
      });
   }
}