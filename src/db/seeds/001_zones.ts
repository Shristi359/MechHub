import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    await knex.raw('TRUNCATE TABLE mechanic_earnings, jobs, mechanics, drivers, zones CASCADE');

    await knex.raw(`
        INSERT INTO zones (name, boundary) VALUES
        (
            'Kathmandu',
            ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[85.27,27.67],[85.35,27.67],[85.35,27.75],[85.27,27.75],[85.27,27.67]]]}')
        ),
        (
            'Lalitpur',
            ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[85.29,27.61],[85.35,27.61],[85.35,27.67],[85.29,27.67],[85.29,27.61]]]}')
        ),
        (
            'Bhaktapur',
            ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[85.35,27.65],[85.45,27.65],[85.45,27.70],[85.35,27.70],[85.35,27.65]]]}')
        );
    `);
}
