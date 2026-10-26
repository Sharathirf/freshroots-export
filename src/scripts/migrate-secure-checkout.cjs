const fs = require('node:fs');
const path = require('node:path');
const { loadEnvConfig } = require('@next/env');
const { Pool } = require('pg');

loadEnvConfig(process.cwd());

async function migrate() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
  const migrationPath = path.join(process.cwd(), 'src/lib/migrations/20261026_secure_admin_and_checkout.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(migrationSql);
    await client.query('COMMIT');
    console.log('Secure admin, payment-attempt, and inventory-reservation tables are ready.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Secure checkout migration failed:', error.code || error.name || 'unknown database error');
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error('Secure checkout migration failed:', error.code || error.name || 'unknown database error');
  process.exitCode = 1;
});
