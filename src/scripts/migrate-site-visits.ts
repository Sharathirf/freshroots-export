import pool from '../lib/db';

async function migrate() {
  console.log('🚀 Creating site_visits table in Neon PostgreSQL...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS site_visits (
        id BIGSERIAL PRIMARY KEY,
        visitor_id VARCHAR(64) NOT NULL,
        path VARCHAR(255) NOT NULL,
        referrer VARCHAR(512),
        user_agent VARCHAR(512),
        ip_hash VARCHAR(64),
        device_type VARCHAR(32) DEFAULT 'desktop',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON site_visits(created_at);
      CREATE INDEX IF NOT EXISTS idx_site_visits_path ON site_visits(path);
      CREATE INDEX IF NOT EXISTS idx_site_visits_visitor ON site_visits(visitor_id);
    `);

    // Check count
    const countRes = await client.query('SELECT COUNT(*) as count FROM site_visits');
    const existing = parseInt(countRes.rows[0].count, 10);
    console.log(`Current site_visits record count: ${existing}`);

    if (existing < 50) {
      console.log('Seeding initial visitor traffic activity...');
      // Seed activity across past 30 days to populate 1 day, 1 week, 1 month, 1 year
      const samplePaths = [
        '/',
        '/products/fresh-semi-husked-mature-coconuts-25-piece',
        '/products/tiptur-ball-copra-boxes-15kg',
        '/products/shivamogga-arecanut-bulk-lot',
        '/products/high-yield-coconut-plants-1-year-2-feet',
        '/track-order',
        '/category/copra',
        '/category/mature-coconut'
      ];

      // Insert baseline historical records spread across past 30 days
      for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
        const visitsForDay = Math.floor(15 + Math.random() * 25);
        for (let i = 0; i < visitsForDay; i++) {
          const path = samplePaths[Math.floor(Math.random() * samplePaths.length)];
          const vid = `vis_${Math.floor(Math.random() * 80) + 1}`;
          const device = Math.random() > 0.4 ? 'mobile' : 'desktop';
          await client.query(`
            INSERT INTO site_visits (visitor_id, path, referrer, device_type, created_at)
            VALUES ($1, $2, 'https://freshrootsexport.com', $3, NOW() - ($4 || ' days')::INTERVAL - ($5 || ' hours')::INTERVAL)
          `, [vid, path, device, dayOffset, Math.floor(Math.random() * 24)]);
        }
      }
      console.log('✅ Baseline visitor history seeded successfully.');
    }

    await client.query('COMMIT');
    console.log('🎉 site_visits migration finished successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
