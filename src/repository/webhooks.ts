import type { Knex } from "knex";
import { inject, injectable } from "tsyringe";
import { WebhooksTableInsert } from "knex/types/tables.js";
declare module "knex/types/tables.js" {
   export interface WebhookTable {
      id: number;
      type: string;
      payload: Record<string, unknown>;
      status: "PENDING" | "SUCCESS" | string;
      created_at: Date;
   }

   // Fields which has defaults on database level
   export type WebhooksTableRequired = "type" | "payload" | "status";
   export type WebhooksTableInsert = Partial<WebhookTable> & Pick<WebhookTable, WebhooksTableRequired>;
   interface Tables {
      webhooks: WebhookTable;
      webhooks_composite: Knex.CompositeTableType<WebhookTable,
      // for select
      WebhooksTableInsert // for insert
      >;
   }
}
@injectable()
export class WebhooksRepository {
   constructor(@inject("db")
   private db: Knex) {}
   create(events: WebhooksTableInsert[]) {
      return this.db("webhooks").insert(events, '*');
   }
   async update(id: number, params: Record<string, unknown>) {
      return this.db("webhooks").where("id", id).update(params);
   }
}