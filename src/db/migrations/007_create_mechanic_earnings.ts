import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
        CREATE TABLE mechanic_earnings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            mechanic_id UUID NOT NULL REFERENCES mechanics(id),
            job_id UUID NOT NULL REFERENCES jobs(id) UNIQUE,
            gross_amount NUMERIC(12,2) NOT NULL,
            platform_fee NUMERIC(12,2) NOT NULL,
            net_amount NUMERIC(12,2) GENERATED ALWAYS AS (gross_amount - platform_fee) STORED,
            payout_status VARCHAR(20) DEFAULT 'PENDING'
                CHECK (payout_status IN ('PENDING','PROCESSING','SETTLED','FAILED')),
            settled_at TIMESTAMPTZ,
            payout_batch_id UUID,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX idx_earnings_pending
            ON mechanic_earnings (mechanic_id)
            WHERE payout_status = 'PENDING';

        CREATE UNIQUE INDEX idx_earnings_job_unique
            ON mechanic_earnings (job_id);
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('mechanic_earnings');
}
