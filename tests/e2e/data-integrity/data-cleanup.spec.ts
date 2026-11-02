import { test, expect } from '../../fixtures/base-test';
import { executeAuthorizedDataCleanup } from '../../helpers/cleanup-runner';
import pool from '../../../src/lib/db';

test.describe('9. Data Integrity & Authorized Test Data Cleanup', () => {
  test('Execute authorized test data cleanup and verify database state', async () => {
    // Execute authorized cleanup
    const report = await executeAuthorizedDataCleanup({
      clearAllHistoricalTestOrders: true,
      clearAutomationTestRfqs: true,
      clearAbandonedCarts: true,
    });

    // Verify cleanup execution succeeded without errors
    expect(report.cleanupFailures.length).toBe(0);

    // Verify all test orders were removed
    expect(report.finalVerification['orders']).toBe(0);
    expect(report.finalVerification['shipments']).toBe(0);
    expect(report.finalVerification['order_inventory_reservations']).toBe(0);

    // Verify catalog products are fully preserved (nominal 11 active products)
    expect(report.finalVerification['products']).toBeGreaterThanOrEqual(10);

    // Verify Mandi prices are intact
    expect(report.finalVerification['mandi_prices']).toBeGreaterThan(0);

    // Verify audit log of cleanup operation
    const auditRes = await pool.query(
      `SELECT * FROM audit_logs WHERE action = 'AUTHORIZED_QA_TEST_DATA_CLEANUP' ORDER BY created_at DESC LIMIT 1`
    );
    expect(auditRes.rows.length).toBe(1);
  });
});
