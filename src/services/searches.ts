import { inject, injectable } from "tsyringe";
import RepliersSearches, { RepliersSearchesFilterDto, RplSearchesCreateDto, RplSearchesUpdateDto } from "./repliers/searches.js";
import type { AppConfig } from "../config.js";
import { ApiError } from "../lib/errors.js";
@injectable()
export default class SearchesService {
   constructor(private repliers: RepliersSearches, @inject("config")
   private config: AppConfig) {}
   create(params: RplSearchesCreateDto) {
      return this.repliers.create({
         ...params
      });
   }
   update(params: RplSearchesUpdateDto) {
      return this.repliers.update({
         ...params
      });
   }
   async delete(params: {
      searchId: number;
      clientId: number;
   }) {
      const response = await this.getAll({
         clientId: params.clientId
      });
      const isOwned = response.searches.find(search => search.searchId === params.searchId);
      if (isOwned === undefined) {
         throw new ApiError("You are not owner of that searchId", 400);
      }
      return this.repliers.delete(params.searchId);
   }
   getAll(params: RepliersSearchesFilterDto) {
      return this.repliers.filter({
         clientId: params.clientId,
         agentId: this.config.repliers.clients.defaultAgentId,
         resultsPerPage: 100
      });
   }
   async getOne(searchId: number) {
      const result = await this.repliers.get(searchId);
      const {
         client: _,
         agentId: __,
         ...rest
      } = result;
      return rest;
   }
}