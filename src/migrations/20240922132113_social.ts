import type { Knex } from "knex";
export async function up(knex: Knex): Promise<void> {
   await knex.schema.raw(`create table social (
             email varchar not null,
             type varchar,
             tokens jsonb not null default '{}'::jsonb,
	created_at timestamp WITHOUT time zone not null default CURRENT_TIMESTAMP,
	updated_at timestamp WITHOUT time zone not null default CURRENT_TIMESTAMP,
	primary key (email, type))`);
}
export async function down(knex: Knex): Promise<void> {
   await knex.schema.dropTable("social");
}