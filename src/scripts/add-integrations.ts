import * as fs from 'node:fs';
import * as path from 'node:path';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

async function addIntegrationTables() {
  const migrationPath = path.join(__dirname, '../lib/migrations/20261026_add_third_party_integrations.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  const { default: pool } = await import('../lib/db');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(migrationSql);
    await client.query('COMMIT');
    console.log('✅ Added the opt-in web push subscription table.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to add the web push subscription table:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

void addIntegrationTables();
