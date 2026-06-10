import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Service types are already inserted in the migration (005_create_service_types.ts)
    // We could add more here, or leave this file empty to avoid duplicates
    // Since we used a migration for the initial data, we'll just skip this one or do a no-op
}
