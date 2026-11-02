import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  readonly headline: Locator;
  readonly catalogSection: Locator;
  readonly searchInput: Locator;
  readonly cartButton: Locator;
  readonly watchlistButton: Locator;
  readonly productCards: Locator;
  readonly rfqLink: Locator;

  constructor(page: Page) {
    super(page);
    this.headline = page.locator('h1');
    this.catalogSection = page.locator('#catalog');
    this.searchInput = page.locator('input[placeholder*="Search"]');
    this.cartButton = page.locator('button[aria-label="Shopping Cart"], button:has-text("Cart")');
    this.watchlistButton = page.locator('button[aria-label="View Watchlist"], button[title="My Watchlist"]');
    this.productCards = page.locator('div[data-testid="product-card"], div.group.relative.bg-white.rounded-3xl');
    this.rfqLink = page.locator('a[href="/rfq"]');
  }

  async searchProduct(term: string) {
    await this.searchInput.first().fill(term);
  }

  async openCart() {
    await this.cartButton.first().click();
  }

  async openWatchlist() {
    await this.watchlistButton.first().click();
  }
}
