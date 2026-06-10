import knex from 'knex';
import { env } from './env';

export const db = knex({
    client: 'pg',
    connection: {
        host:     env.DB_HOST,
        port:     env.DB_PORT,
        database: env.DB_NAME,
        user:     env.DB_USER,
        password: env.DB_PASSWORD,
    },
    pool: {
        min: 2,
        max: 20,
    },
    migrations: {
        directory: '../db/migrations',
        extension: 'ts',
    },
});
