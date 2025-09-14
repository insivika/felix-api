import { injectable } from "tsyringe";
import { UserAssetsCreateDto, UserAssetsGetDto, UserAssetsRemoveDto } from "../../validate/user/assets.js";
import { AssetsRepository } from "../../repository/assets.js";
import { ApiError } from "../../lib/errors.js";
@injectable()
export default class AssetsService {
   constructor(private repo: AssetsRepository) {}
   async create(params: UserAssetsCreateDto) {
      const {
         id,
         email,
         type,
         ...data
      } = params;
      const result = await this.repo.createAsset(id, email, type, data);
      if (result.length === 0) {
         throw new ApiError("There is already asset with such id", 409);
      }
      return true;
   }
   async remove(params: UserAssetsRemoveDto) {
      const {
         id,
         email,
         type
      } = params;
      return this.repo.removeAsset(id, type, email);
   }
   async get(params: UserAssetsGetDto) {
      const {
         email,
         type
      } = params;
      const result = await this.repo.getAssets(email, type);
      return result.map(item => ({
         id: item.id,
         ...item.data
      }));
   }
}