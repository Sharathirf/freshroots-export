import fs from 'node:fs';
import path from 'node:path';
import { query } from '@/lib/db';

interface IntegrationSettingRow {
  key: string;
  value: string;
  service_id: string;
  updated_at: string;
}

// In-memory cache for fast lookups across requests in the same serverless instance
let settingsCache: Map<string, string> = new Map();
let lastCacheSync = 0;
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

/**
 * Ensures table exists and synchronizes settings from PostgreSQL into process.env
 */
export async function loadIntegrationSettings(): Promise<Map<string, string>> {
  const now = Date.now();
  if (settingsCache.size > 0 && now - lastCacheSync < CACHE_TTL_MS) {
    return settingsCache;
  }

  try {
    // Ensure table exists
    await query(`
      CREATE TABLE IF NOT EXISTS app_integration_settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL,
        service_id VARCHAR(100) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const rows = await query<IntegrationSettingRow>(
      `SELECT key, value, service_id, updated_at FROM app_integration_settings`
    );

    const newMap = new Map<string, string>();
    for (const r of rows) {
      if (r.key && r.value) {
        newMap.set(r.key, r.value);
        // Also populate process.env for downstream libraries that inspect environment variables directly
        process.env[r.key] = r.value;
        if (r.key === 'NEXT_PUBLIC_SENTRY_DSN') {
          process.env.SENTRY_DSN = r.value;
        }
      }
    }

    settingsCache = newMap;
    lastCacheSync = now;
    return settingsCache;
  } catch (err) {
    console.error('Failed to load integration settings from DB:', err);
    return settingsCache;
  }
}

/**
 * Saves or updates a setting in the database and sets it in process.env
 */
export async function saveIntegrationSetting(
  key: string,
  value: string,
  serviceId: string
): Promise<void> {
  const cleanVal = value.trim();

  // 1. Update in-memory & process.env immediately
  process.env[key] = cleanVal;
  if (key === 'NEXT_PUBLIC_SENTRY_DSN') {
    process.env.SENTRY_DSN = cleanVal;
  }
  settingsCache.set(key, cleanVal);

  // 2. Persist to Neon PostgreSQL database
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS app_integration_settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL,
        service_id VARCHAR(100) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(
      `
      INSERT INTO app_integration_settings (key, value, service_id, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value,
          service_id = EXCLUDED.service_id,
          updated_at = NOW()
      `,
      [key, cleanVal, serviceId]
    );
  } catch (dbErr) {
    console.error(`Failed to persist setting ${key} to PostgreSQL:`, dbErr);
    throw new Error('Database persistence failed');
  }

  // 3. Optional: best-effort local .env.local update (dev environment only)
  tryPersistToEnvLocal(key, cleanVal);
}

/**
 * Best-effort file sync for local development. In serverless / read-only runtimes (e.g. Vercel),
 * any write failure is safely ignored because PostgreSQL is the primary authority.
 */
function tryPersistToEnvLocal(key: string, value: string) {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

    const escapedVal = value.replace(/"/g, '\\"');
    const regex = new RegExp(`^${key}=.*$`, 'm');

    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}="${escapedVal}"`);
    } else {
      envContent += `\n${key}="${escapedVal}"`;
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
  } catch (fileErr) {
    // Read-only filesystem in serverless environments (Vercel) is expected; DB persistence handles storage
  }
}
