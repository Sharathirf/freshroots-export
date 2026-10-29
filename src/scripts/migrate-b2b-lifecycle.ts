import fs from 'node:fs';
import path from 'node:path';
import { query } from '../lib/db';

async function runMigration() {
  console.log('🚀 Running B2B Lifecycle and Audit Trail Migration...');
  const sqlPath = path.join(process.cwd(), 'src/lib/migrations/20261029_b2b_lifecycle_and_audit_trail.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    await query(sql);
    console.log('✅ Migration executed successfully!');

    // Verify wholesale_quotations columns
    const cols = await query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'wholesale_quotations'`
    );
    console.log('wholesale_quotations total columns:', cols.length);

    // Verify table creation
    const tables = await query(
      `SELECT table_name FROM information_schema.tables WHERE table_name IN (
        'rfq_activities', 'rfq_discussions', 'quotation_revisions',
        'b2b_handovers', 'b2b_fulfilments', 'b2b_payments', 'b2b_followups'
      )`
    );
    console.log('Created tables:', tables.map((t: any) => t.table_name));
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
