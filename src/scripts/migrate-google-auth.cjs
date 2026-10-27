const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function runMigration() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://apple@localhost:5432/tiptur_direct';
  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    const migrationPath = path.join(__dirname, '../lib/migrations/20261027_add_google_auth_and_customer_metadata.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('✅ Successfully applied Google Auth & Customer Metadata migration to users table.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
