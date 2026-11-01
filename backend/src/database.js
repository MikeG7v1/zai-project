import knex from 'knex';
import pg from 'pg';
import knexConfig from '../knexfile.js';

// pg returns bigint values, including COUNT results, as strings by default.
pg.types.setTypeParser(pg.types.builtins.INT8, Number);

export const db = knex(knexConfig);
