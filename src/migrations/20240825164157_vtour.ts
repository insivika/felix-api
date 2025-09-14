import type { Knex } from "knex";
export async function up(knex: Knex): Promise<void> {
   await knex.schema.raw(`create table vtour (
    	id varchar not null,
    	owner_id bigint,
    	data jsonb not null DEFAULT '{}'::jsonb,
    	created_at timestamp not null default CURRENT_TIMESTAMP,
    	updated_at timestamp not null default CURRENT_TIMESTAMP,
    	PRIMARY KEY (id)
    )`);
}
export async function down(knex: Knex): Promise<void> {
   await knex.schema.raw(`drop table vtour`);
}