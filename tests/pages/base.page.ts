import { Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path = '/') {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle').catch(() => undefined);
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async closeAnyModals() {
    const closeBtns = this.page.locator('button[aria-label="Close"], button:has-text("✕"), button:has-text("Close")');
    const count = await closeBtns.count();
    for (let i = 0; i < count; i++) {
      if (await closeBtns.nth(i).isVisible()) {
        await closeBtns.nth(i).click().catch(() => undefined);
      }
    }
  }
}
