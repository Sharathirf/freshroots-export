import { Pool } from 'pg';

declare global {
  var __pgPool: Pool | undefined;
}

// Create a singleton connection pool for PostgreSQL
const pool =
  globalThis.__pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://apple@localhost:5432/tiptur_direct',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__pgPool = pool;
}

export default pool;

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}
