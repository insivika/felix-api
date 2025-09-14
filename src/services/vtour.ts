import { VtourCreateDto, VtourUpdateDto } from "../validate/vtour.js";
import { VtourRepository } from "../repository/vtour.js";
import { injectable } from "tsyringe";
import { ApiError } from "../lib/errors.js";
@injectable()
export default class VtourService {
   constructor(private repo: VtourRepository) {}
   async create(params: VtourCreateDto) {
      const result = await this.repo.create(params);
      if (result.length <= 0) {
         throw new ApiError('Vtour with provided slug already exist', 409);
      }
      return result;
   }
   update(params: VtourUpdateDto) {
      const {
         id,
         data
      } = params;
      return this.repo.update(id, {
         data
      });
   }
   remove(id: string) {
      return this.repo.remove(id);
   }
   getOne(id: string) {
      return this.repo.getOne(id);
   }
}