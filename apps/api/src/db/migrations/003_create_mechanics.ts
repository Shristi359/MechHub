import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
        CREATE TABLE mechanics (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            full_name VARCHAR(255) NOT NULL,
            phone VARCHAR(15) UNIQUE NOT NULL,
            location GEOGRAPHY(POINT, 4326),
            rating DECIMAL(2,1) DEFAULT 5.0
                CHECK (rating >= 1.0 AND rating <= 5.0),
            status VARCHAR(20) DEFAULT 'OFFLINE'
                CHECK (status IN ('ONLINE','OFFLINE','BUSY','SUSPENDED')),
            zone_id UUID REFERENCES zones(id),
            wallet_balance NUMERIC(12,2) DEFAULT 0.00
                CHECK (wallet_balance >= 0),
            fcm_token TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX idx_mechanics_location_gist
            ON mechanics USING GIST (location);

        CREATE INDEX idx_mechanics_online
            ON mechanics (status) WHERE status = 'ONLINE';

        CREATE INDEX idx_mechanics_zone
            ON mechanics (zone_id, status);
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('mechanics');
}
