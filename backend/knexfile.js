import 'dotenv/config';

const ssl = process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : false;

export default {
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl,
  },
  pool: { min: 0, max: 10 },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
  },
};
