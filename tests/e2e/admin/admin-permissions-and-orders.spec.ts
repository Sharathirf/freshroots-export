import { test, expect } from '../../fixtures/base-test';
import { loginAsAdmin } from '../../helpers/auth-helpers';
import { createAdminSession } from '../../../src/lib/admin-auth';
import { getAuditLogs, getTableCounts } from '../../helpers/db-helpers';

test.describe('4. Admin Permissions & Mandatory Order Deletion Prohibitions', () => {
  test('Admin dashboard exposes operations tabs and controls', async ({ context, page, baseURL }) => {
    await loginAsAdmin(context, baseURL || 'http://localhost:3000');
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    // Verify operations desk loaded
    await expect(page.locator('text=/Operations|Dashboard|FreshRoots/i').first()).toBeVisible();

    // Verify presence of tabs (Orders, RFQs, CRM Desk, Inventory, Analytics)
    await expect(page.locator('button:has-text("Orders"), button:has-text("B2B RFQs"), button:has-text("Overview")').first()).toBeVisible();
  });

  test('MANDATORY SECURITY RULE: UI exposes NO "Delete Order" buttons anywhere', async ({ context, page, baseURL }) => {
    await loginAsAdmin(context, baseURL || 'http://localhost:3000');
    await page.goto('/admin?tab=orders', { waitUntil: 'domcontentloaded' });

    // Check across entire page: no Delete Order buttons
    const deleteBtn = page.locator('button:has-text("Delete Order"), button:has-text("Delete Orders"), button:has-text("Bulk Delete"), button[title*="Delete Order" i]');
    const count = await deleteBtn.count();
    expect(count).toBe(0);
  });

  test('MANDATORY SECURITY RULE: Direct DELETE /api/admin/orders returns HTTP 403 Forbidden', async ({ request, baseURL }) => {
    const { value: sessionCookie } = createAdminSession();
    const origin = baseURL || 'http://localhost:3000';

    const countsBefore = await getTableCounts();

    const deleteRes = await request.delete('/api/admin/orders', {
      headers: {
        Cookie: `freshroots_admin_session=${sessionCookie}`,
        Origin: origin,
      },
      data: {
        id: 'some-order-id',
      },
    });

    // Mandatory: Must return 403 Forbidden
    expect(deleteRes.status()).toBe(403);
    const json = await deleteRes.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain('Forbidden');
    expect(json.code).toBe('ORDER_DELETION_PROHIBITED');

    // Verify zero records were deleted
    const countsAfter = await getTableCounts();
    expect(countsAfter.orders).toBe(countsBefore.orders);

    // Verify unauthorized attempt logged in audit_logs
    const auditLogs = await getAuditLogs('UNAUTHORIZED_ORDER_DELETE_ATTEMPT_BLOCKED');
    expect(auditLogs.length).toBeGreaterThan(0);
  });

  test('MANDATORY SECURITY RULE: Direct DELETE /api/orders returns HTTP 403 Forbidden', async ({ request }) => {
    const countsBefore = await getTableCounts();

    const deleteRes = await request.delete('/api/orders', {
      data: {
        id: 'some-order-id',
      },
    });

    expect(deleteRes.status()).toBe(403);
    const json = await deleteRes.json();
    expect(json.success).toBe(false);
    expect(json.code).toBe('ORDER_DELETION_PROHIBITED');

    const countsAfter = await getTableCounts();
    expect(countsAfter.orders).toBe(countsBefore.orders);
  });

  test('MANDATORY SECURITY RULE: Direct DELETE /api/admin/crm/orders returns HTTP 403 Forbidden', async ({ request, baseURL }) => {
    const { value: sessionCookie } = createAdminSession();
    const origin = baseURL || 'http://localhost:3000';

    const countsBefore = await getTableCounts();

    const deleteRes = await request.delete('/api/admin/crm/orders', {
      headers: {
        Cookie: `freshroots_admin_session=${sessionCookie}`,
        Origin: origin,
      },
      data: {
        id: 'some-order-id',
      },
    });

    expect(deleteRes.status()).toBe(403);
    const json = await deleteRes.json();
    expect(json.success).toBe(false);
    expect(json.code).toBe('ORDER_DELETION_PROHIBITED');

    const countsAfter = await getTableCounts();
    expect(countsAfter.orders).toBe(countsBefore.orders);
  });
});
