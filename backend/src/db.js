const { Pool, types } = require('pg');
require('dotenv').config();

types.setTypeParser(1114, v => v.replace(' ', 'T'));
types.setTypeParser(1184, v => v.replace(' ', 'T'));

const pool = new Pool(
    process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
        : {
              host: process.env.DB_HOST || 'localhost',
              port: parseInt(process.env.DB_PORT) || 5432,
              database: process.env.DB_NAME || 'sgmc',
              user: process.env.DB_USER || 'postgres',
              password: process.env.DB_PASSWORD || 'postgres',
              max: 10,
              idleTimeoutMillis: 30000,
          },
);

pool.on('error', (err) => {
    console.error('Error inesperado en el pool de PostgreSQL:', err);
});

module.exports = pool;