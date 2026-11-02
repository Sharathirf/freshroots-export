import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class WatchlistPage extends BasePage {
  readonly drawer: Locator;
  readonly closeButton: Locator;
  readonly emptyNotice: Locator;
  readonly watchlistItems: Locator;
  readonly removeButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.drawer = page.locator('div.fixed.inset-0, div[role="dialog"], aside').filter({ hasText: /My Watchlist|Watchlist/i });
    this.closeButton = page.locator('button:has-text("✕"), button[aria-label="Close"], button:has(svg.lucide-x)');
    this.emptyNotice = page.locator('text=/Watchlist is Empty/i');
    this.watchlistItems = page.locator('div.border.rounded-2xl, div.p-3').filter({ hasText: /₹/ });
    this.removeButtons = page.locator('button[title*="Remove from watchlist" i]');
  }

  async close() {
    await this.closeButton.first().click().catch(() => undefined);
  }
}
