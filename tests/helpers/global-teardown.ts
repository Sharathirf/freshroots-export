import { executeAuthorizedDataCleanup } from './cleanup-runner';

/**
 * Playwright Global Teardown Hook
 * Automatically runs once after all test suites complete to guarantee
 * zero residual test orders, test RFQs, or test visitor logs in the database.
 */
export default async function globalTeardown() {
  console.log('\n--- EXECUTING PLAYWRIGHT GLOBAL TEARDOWN CLEANUP ---');
  try {
    const summary = await executeAuthorizedDataCleanup({ retainGenuineData: true });
    console.log('--- GLOBAL TEARDOWN CLEANUP SUMMARY ---', summary);
  } catch (error) {
    console.error('Global teardown cleanup warning:', error);
  }
}
