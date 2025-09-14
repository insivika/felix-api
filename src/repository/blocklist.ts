import dayjs from "dayjs";
import Keyv from "keyv";
import { inject, injectable } from "tsyringe";
@injectable()
export class BlocklistRepository {
   constructor(@inject('keyv.blocklist')
   private db: Keyv) {}
   create(jti: string, exp: number) {
      return this.db.set(jti, exp, dayjs.unix(exp).diff());
   }
   async isRevoked(jti: string) {
      return this.db.has(jti);
   }
   cleanupExpired() {
      return true;
   }
}