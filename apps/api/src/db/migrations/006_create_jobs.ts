import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
        CREATE TABLE jobs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            driver_id UUID NOT NULL REFERENCES drivers(id),
            mechanic_id UUID REFERENCES mechanics(id),
            service_type_id UUID NOT NULL REFERENCES service_types(id),
            problem_description TEXT,
            location GEOGRAPHY(POINT, 4326) NOT NULL,
            zone_id UUID REFERENCES zones(id),
            estimated_fare NUMERIC(10,2),
            mechanic_quote NUMERIC(10,2),
            final_amount NUMERIC(10,2),
            status VARCHAR(30) DEFAULT 'PENDING'
                CHECK (status IN (
                    'PENDING', 'DISPATCHED', 'ASSIGNED',
                    'MECHANIC_EN_ROUTE', 'MECHANIC_ARRIVED',
                    'QUOTE_PENDING', 'QUOTE_ACCEPTED',
                    'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'UNFULFILLED'
                )),
            dispatch_round INTEGER DEFAULT 1
                CHECK (dispatch_round BETWEEN 1 AND 4),
            dispatched_mechanic_ids UUID[] DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            dispatched_at TIMESTAMPTZ,
            assigned_at TIMESTAMPTZ,
            quote_sent_at TIMESTAMPTZ,
            work_started_at TIMESTAMPTZ,
            completed_at TIMESTAMPTZ,
            round_started_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX idx_jobs_pending
            ON jobs (round_started_at)
            WHERE status IN ('PENDING', 'DISPATCHED');

        CREATE INDEX idx_jobs_driver
            ON jobs (driver_id, status);
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('jobs');
}
