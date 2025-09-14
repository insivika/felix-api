import type { Knex } from "knex";
import { inject, injectable } from "tsyringe";
import { PeopleSyncTableInsert } from "knex/types/tables.js";
import { PeopleSyncStatus } from "../constants.js";
import { PeopleSyncPayload } from "../services/sync.js";
declare module "knex/types/tables.js" {
   export interface PeopleSyncTable {
      id: number;
      sync_id: number;
      payload: PeopleSyncPayload;
      user_id: number; // FUB ID
      people_id: number; // FUB ID
      agent_id: number; // repliers ID
      client_id: number; // repliers ID
      status: PeopleSyncStatus;
      created_at: Date;
   }

   // Fields which has defaults on database level
   export type PeopleSyncTableRequired = "sync_id" | "payload" | "user_id" | "people_id" | "agent_id" | "status";
   export type PeopleSyncTableInsert = Partial<PeopleSyncTable> & Pick<PeopleSyncTable, PeopleSyncTableRequired>;
   interface Tables {
      people_sync: PeopleSyncTable;
      people_sync_composite: Knex.CompositeTableType<PeopleSyncTable,
      // for select
      PeopleSyncTableInsert // for insert
      >;
   }
}
@injectable()
export class PeopleSyncRepository {
   constructor(@inject("db")
   private db: Knex) {}
   async getPeoples(syncId: number) {
      console.log(`${syncId}`);
   }
   getById(id: number) {
      return this.db("people_sync").where("id", id).first();
   }
   async createPeople(people: PeopleSyncTableInsert[], tx?: Knex.Transaction) {
      const query = tx ? tx : this.db;
      return query("people_sync").insert(people).returning("*");
   }
   async update(id: number, params: Record<string, unknown>) {
      return this.db("people_sync").where("id", id).update(params);
   }
}