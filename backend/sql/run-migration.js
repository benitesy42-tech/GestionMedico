const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://postgres:jPfnuZklAAzXczJBmIYmUsLEBbWekEaH@monorail.proxy.rlwy.net:26715/railway';

async function runMigration() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Conectado a Railway PostgreSQL');

  const sql = fs.readFileSync(path.join(__dirname, 'migracion-examenes.sql'), 'utf8');
  await client.query(sql);
  console.log('Migración ejecutada correctamente');

  await client.end();
}

runMigration().catch(err => {
  console.error('Error en migración:', err.message);
  process.exit(1);
});
