const { Client } = require('pg');
const DATABASE_URL = 'postgresql://postgres:jPfnuZklAAzXczJBmIYmUsLEBbWekEaH@monorail.proxy.rlwy.net:26715/railway';

async function check() {
  const c = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const r = await c.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
  console.log('Tablas en Railway:');
  r.rows.forEach(row => console.log(' -', row.table_name));
  const rc = await c.query('SELECT COUNT(*) FROM rango_referencia');
  console.log('Rangos de referencia:', rc.rows[0].count);
  await c.end();
}
check().catch(e => { console.error(e.message); process.exit(1); });
