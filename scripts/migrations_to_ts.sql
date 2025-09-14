update knex_migrations set name = regexp_replace(name, '\.(js)$', '.ts')
