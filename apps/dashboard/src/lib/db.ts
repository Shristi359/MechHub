import knex from 'knex';
import dotenv from 'dotenv';
import path from 'path';

// Load the root .env file
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'mechhub',
    user: process.env.DB_USER || 'mechhub',
    password: process.env.DB_PASSWORD,
  },
});

export default db;
