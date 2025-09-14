import type { Knex } from "knex";
import { inject, injectable } from "tsyringe";
import { SocialProvider } from "../constants.js";
import { SocialTable } from "knex/types/tables.js";
declare module "knex/types/tables.js" {
   export interface SocialTable {
      email: string;
      type: SocialProvider;
      tokens: Record<string, unknown>;
      created_at: Date;
      updated_at: Date;
   }
   interface Tables {
      social: SocialTable;
   }
}
@injectable()
export class SocialRepository {
   constructor(@inject("db")
   private db: Knex) {}
   async getUserTokens(email: string): Promise<SocialTable[]>;
   async getUserTokens(email: string, type: SocialProvider): Promise<SocialTable | null>;
   async getUserTokens(email: string, type?: SocialProvider): Promise<SocialTable[] | Pick<SocialTable, "type" | "tokens"> | null> {
      const query = this.db.table("social").select<"type" | "tokens">("type", "tokens").where({
         email
      });
      if (type) {
         query.where({
            type
         }).first();
      }
      return query;
   }
   createTokens(email: string, type: SocialProvider, tokens: Record<string, unknown>) {
      return this.db.table("social").insert({
         email,
         type,
         tokens
      }).returning("*").onConflict(["email", "type"]).merge();
   }
   updateAccessToken(email: string, type: SocialProvider, access_token: string) {
      return this.db.table("social").update("tokens", this.db.raw(`jsonb_set(tokens, '{access_token}', '"${access_token}"', true)`)).update("updated_at", this.db.fn.now()).where({
         email,
         type
      }).returning("*");
   }
   updateRefreshToken(email: string, type: SocialProvider, refresh_token: string) {
      return this.db.table("social").update("tokens", this.db.raw(`jsonb_set(tokens, '{refresh_token}', '"${refresh_token}"', true)`)).update("updated_at", this.db.fn.now()).where({
         email,
         type
      }).returning("*").first();
   }
   deleteTokens(email: string, type: SocialProvider) {
      return this.db.table("social").delete().where({
         email,
         type
      });
   }
}