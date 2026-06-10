import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
        CREATE TABLE service_types (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL UNIQUE,
            base_fare NUMERIC(10,2) NOT NULL,
            per_km_rate NUMERIC(8,2) DEFAULT 0,
            description TEXT,
            is_active BOOLEAN DEFAULT true
        );

        INSERT INTO service_types (name, base_fare, per_km_rate, description) VALUES
            ('Flat Tire Repair',    500,  50, 'Puncture repair or tire change'),
            ('Battery Jump Start',  400,  40, 'Battery boost or replacement'),
            ('Engine Breakdown',   1000, 100, 'On-site engine diagnostics'),
            ('Fuel Delivery',       300,  30, 'Emergency fuel delivery'),
            ('Towing',             1500, 150, 'Vehicle towing to nearest garage'),
            ('General Repair',      800,  80, 'Miscellaneous roadside repair');
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('service_types');
}
