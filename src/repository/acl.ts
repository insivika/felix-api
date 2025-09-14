import { UserRole } from "../constants.js";
import type { Knex } from "knex";
import { inject, injectable } from "tsyringe";
declare module 'knex/types/tables.js' {
   export interface AclTable {
      email: string;
      role: UserRole;
      created_at: Date;
   }
   interface Tables {
      acl: AclTable;
   }
}
@injectable()
export class AclRepository {
   constructor(@inject("db")
   private db: Knex) {}
   async getUserAcl(email: string) {
      //  you have to specify '*' so query will return AclTable, and not any | AclTable
      return this.db.table("acl").select('*').where({
         email
      }).first();
   }
}