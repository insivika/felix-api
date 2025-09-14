import type { Knex } from "knex";
import { inject, injectable } from "tsyringe";
import { SyncTable } from "knex/types/tables.js";
declare module "knex/types/tables.js" {
   export interface SyncTable {
      id: number;
      last_processed_at: Date;
      created_at: Date;
   }
   interface Tables {
      sync: SyncTable;
   }
}
@injectable()
export class SyncRepository {
   constructor(@inject("db")
   private db: Knex) {}
   async startSync(): Promise<[tx: Knex.Transaction, sync: SyncTable]> {
      const tx = await this.db.transaction();
      const sync = await tx("sync").insert({}, "*");
      if (sync[0] === undefined) {
         throw new Error("Failed to start sync");
      }
      return [tx, sync[0]];
   }
   async updateLastProcessedAt(id: number) {
      return this.db("sync").where("id", id).update({
         last_processed_at: new Date()
      });
   }
   async getSyncs(): Promise<SyncTable[]> {
      return this.db.select().from("sync");
   }
   async getLatestSync(): Promise<SyncTable> {
      return this.db.select().from("sync").orderBy("id", "desc").limit(1).first();
   }
}