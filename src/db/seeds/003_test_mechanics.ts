import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // TRUNCATE handled by 001_zones.ts

    const kathmanduZone = await knex('zones').where({ name: 'Kathmandu' }).first();
    const lalitpurZone = await knex('zones').where({ name: 'Lalitpur' }).first();

    const ktmId = kathmanduZone?.id || null;
    const ltpId = lalitpurZone?.id || null;

    await knex.raw(`
        INSERT INTO mechanics (full_name, phone, rating, status, zone_id, location, fcm_token) VALUES
        ('Ramesh Mechanic', '9800000001', 4.8, 'ONLINE', ?, ST_SetSRID(ST_MakePoint(85.31, 27.71), 4326), 'token_1'),
        ('Hari Sharma',     '9800000002', 4.5, 'ONLINE', ?, ST_SetSRID(ST_MakePoint(85.32, 27.70), 4326), 'token_2'),
        ('Sita Auto',       '9800000003', 4.9, 'ONLINE', ?, ST_SetSRID(ST_MakePoint(85.30, 27.72), 4326), 'token_3'),
        ('Gopal Thapa',     '9800000004', 4.2, 'ONLINE', ?, ST_SetSRID(ST_MakePoint(85.33, 27.71), 4326), 'token_4'),
        ('Nita Repairs',    '9800000005', 5.0, 'ONLINE', ?, ST_SetSRID(ST_MakePoint(85.32, 27.69), 4326), 'token_5'),
        ('Bikash Maharjan', '9800000006', 4.6, 'OFFLINE', ?, ST_SetSRID(ST_MakePoint(85.31, 27.65), 4326), 'token_6'),
        ('Sunil Shrestha',  '9800000007', 4.4, 'OFFLINE', ?, ST_SetSRID(ST_MakePoint(85.30, 27.64), 4326), 'token_7'),
        ('Rajesh Lama',     '9800000008', 4.7, 'ONLINE', ?, ST_SetSRID(ST_MakePoint(85.33, 27.66), 4326), 'token_8')
    `, [ktmId, ktmId, ktmId, ktmId, ktmId, ltpId, ltpId, ltpId]);
}
