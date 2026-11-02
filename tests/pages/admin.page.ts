import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class AdminPage extends BasePage {
  readonly ordersTab: Locator;
  readonly rfqsTab: Locator;
  readonly crmTab: Locator;
  readonly analyticsTab: Locator;
  readonly ordersTable: Locator;
  readonly deleteOrderButtons: Locator;
  readonly orderStatusSelect: Locator;
  readonly rfqCards: Locator;

  constructor(page: Page) {
    super(page);
    this.ordersTab = page.locator('button:has-text("Orders"), a[href*="tab=orders"]');
    this.rfqsTab = page.locator('button:has-text("RFQs"), a[href*="tab=rfqs"]');
    this.crmTab = page.locator('button:has-text("CRM"), a[href*="tab=crm"]');
    this.analyticsTab = page.locator('button:has-text("Analytics"), a[href*="tab=analytics"]');
    this.ordersTable = page.locator('table').first();
    // Security check: Delete order buttons must NOT exist
    this.deleteOrderButtons = page.locator('button:has-text("Delete Order"), button[title*="Delete Order" i], button:has-text("Bulk Delete")');
    this.orderStatusSelect = page.locator('select');
    this.rfqCards = page.locator('div[data-testid="rfq-card"], tr');
  }

  async selectTab(tabName: 'orders' | 'rfqs' | 'crm' | 'analytics') {
    const tabMap = {
      orders: this.ordersTab,
      rfqs: this.rfqsTab,
      crm: this.crmTab,
      analytics: this.analyticsTab,
    };
    await tabMap[tabName].first().click();
  }
}
