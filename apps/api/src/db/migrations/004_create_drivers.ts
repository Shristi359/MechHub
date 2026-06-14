import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
        CREATE TABLE drivers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            full_name VARCHAR(255) NOT NULL,
            phone VARCHAR(15) UNIQUE NOT NULL,
            vehicle_type VARCHAR(50),
            vehicle_number VARCHAR(20),
            fcm_token TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('drivers');
}
