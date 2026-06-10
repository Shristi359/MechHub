import { env } from './src/config/env';

export default {
    client: 'pg',
    connection: {
        host:     env.DB_HOST,
        port:     env.DB_PORT,
        database: env.DB_NAME,
        user:     env.DB_USER,
        password: env.DB_PASSWORD,
    },
    migrations: {
        directory: './src/db/migrations',
        extension: 'ts',
    },
    seeds: {
        directory: './src/db/seeds',
    },
};
