import type { Knex } from "knex";
export async function up(knex: Knex): Promise<void> {
   await knex.schema.raw(`create table acl (
	email varchar not null PRIMARY KEY,
	role smallint not null,
	created_at timestamp not null default CURRENT_TIMESTAMP
    )`);
}
export async function down(knex: Knex): Promise<void> {
   await knex.schema.raw(`drop table acl`);
}