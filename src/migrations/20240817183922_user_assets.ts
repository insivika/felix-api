import type { Knex } from "knex";
export async function up(knex: Knex): Promise<void> {
   await knex.schema.raw(`create table assets (
	id varchar not null,
	email VARCHAR not null,
	type VARCHAR not null,
	data jsonb not null DEFAULT '{}'::jsonb,
	created_at timestamp not null default CURRENT_TIMESTAMP,
	PRIMARY KEY (id, email, type)
    )`);
}
export async function down(knex: Knex): Promise<void> {
   await knex.schema.raw(`drop table assets`);
}