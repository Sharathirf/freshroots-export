import * as fs from 'node:fs';
import * as path from 'node:path';
import pool from '../lib/db';

async function addArecanutCatalogItem() {
  const migrationPath = path.join(__dirname, '../lib/migrations/20261026_add_arecanut_bulk.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(migrationSql);
    await client.query('COMMIT');
    console.log('✅ Added the bulk-only Shimoga arecanut catalog item.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to add the Shimoga arecanut catalog item:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

void addArecanutCatalogItem();
