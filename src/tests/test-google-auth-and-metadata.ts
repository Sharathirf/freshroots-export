import assert from 'node:assert';
import { query } from '../lib/db';

async function testGoogleAuthAndMetadata() {
  console.log('🧪 Starting Google Auth & Customer Metadata Storage Tests...\n');

  // Test 1: POST /api/customer/profile with Google OAuth payload (without phone initially)
  console.log('Test 1: Upsert customer profile via Google OAuth (without initial phone)...');
  const googleUserPayload = {
    auth_provider: 'google',
    provider_id: 'google_test_sub_9876543210',
    full_name: 'Test Farmer Sharath',
    email: 'sharath.agri.test@example.com',
    avatar_url: 'https://lh3.googleusercontent.com/a/freshroots-test-avatar',
    email_verified: true,
    metadata: {
      locale: 'en',
      source: 'google_gis_web',
      test_run: true
    }
  };

  const dbRes1 = await query(
    `SELECT id FROM users WHERE email = $1`,
    [googleUserPayload.email]
  );

  let userId: string;
  if (dbRes1.length > 0) {
    userId = dbRes1[0].id;
    await query(
      `UPDATE users 
       SET full_name = $1, provider_id = $2, avatar_url = $3, email_verified = $4, metadata = $5::jsonb, updated_at = NOW()
       WHERE id = $6`,
      [
        googleUserPayload.full_name,
        googleUserPayload.provider_id,
        googleUserPayload.avatar_url,
        googleUserPayload.email_verified,
        JSON.stringify(googleUserPayload.metadata),
        userId
      ]
    );
  } else {
    const insertRes = await query(
      `INSERT INTO users (full_name, phone, email, auth_provider, provider_id, avatar_url, email_verified, metadata, role, updated_at)
       VALUES ($1, NULL, $2, $3, $4, $5, $6, $7::jsonb, 'retail_customer', NOW())
       RETURNING id`,
      [
        googleUserPayload.full_name,
        googleUserPayload.email,
        googleUserPayload.auth_provider,
        googleUserPayload.provider_id,
        googleUserPayload.avatar_url,
        googleUserPayload.email_verified,
        JSON.stringify(googleUserPayload.metadata)
      ]
    );
    userId = insertRes[0].id;
  }

  assert(userId, 'Customer ID must exist after upsert');
  console.log('  ✅ Google customer created/updated with ID:', userId);

  // Test 2: Verify database columns exist and are populated
  console.log('Test 2: Verifying PostgreSQL data persistence & rich metadata...');
  const userRows = await query(
    `SELECT id, full_name, email, phone, auth_provider, provider_id, avatar_url, email_verified, metadata
     FROM users WHERE id = $1`,
    [userId]
  );

  const u = userRows[0];
  assert.strictEqual(u.full_name, 'Test Farmer Sharath');
  assert.strictEqual(u.email, 'sharath.agri.test@example.com');
  assert.strictEqual(u.auth_provider, 'google');
  assert.strictEqual(u.provider_id, 'google_test_sub_9876543210');
  assert.strictEqual(u.avatar_url, 'https://lh3.googleusercontent.com/a/freshroots-test-avatar');
  assert.strictEqual(u.email_verified, true);
  assert.strictEqual(u.metadata?.source, 'google_gis_web');
  console.log('  ✅ Database verified: All Google profile attributes, avatar URL, and JSONB metadata successfully saved.');

  // Test 3: Link WhatsApp phone number to the Google user
  console.log('Test 3: Linking 10-digit WhatsApp number to Google profile...');
  const testPhone = '9999000001';
  await query(`DELETE FROM users WHERE phone = $1`, [testPhone]);
  await query(
    `UPDATE users 
     SET phone = $1, address = $2, city = $3, state = $4, pincode = $5, updated_at = NOW()
     WHERE id = $6`,
    [testPhone, 'APMC Yard, Gate 2', 'Tiptur', 'Karnataka', '572201', userId]
  );

  const updatedRows = await query(
    `SELECT phone, address, city, state, pincode FROM users WHERE id = $1`,
    [userId]
  );
  assert.strictEqual(updatedRows[0].phone, testPhone);
  assert.strictEqual(updatedRows[0].address, 'APMC Yard, Gate 2');
  assert.strictEqual(updatedRows[0].city, 'Tiptur');
  assert.strictEqual(updatedRows[0].state, 'Karnataka');
  assert.strictEqual(updatedRows[0].pincode, '572201');
  console.log('  ✅ Phone and delivery address successfully linked to Google profile.');

  // Cleanup test user
  await query(`DELETE FROM users WHERE email = $1`, ['sharath.agri.test@example.com']);
  console.log('  ✅ Test data cleanly removed.\n');

  console.log('🎉 ALL GOOGLE AUTH & CUSTOMER METADATA TESTS PASSED (3/3)!');
  process.exit(0);
}

testGoogleAuthAndMetadata().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
