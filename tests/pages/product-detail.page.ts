import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class ProductDetailPage extends BasePage {
  readonly title: Locator;
  readonly price: Locator;
  readonly addToCartButton: Locator;
  readonly watchlistButton: Locator;
  readonly quantityPlus: Locator;
  readonly quantityMinus: Locator;
  readonly quantityDisplay: Locator;
  readonly rfqButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator('h1');
    this.price = page.locator('div:has-text("₹")').first();
    this.addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("Add")').first();
    this.watchlistButton = page.locator('button[title*="Watchlist"]').first();
    this.quantityPlus = page.locator('button:has-text("+")');
    this.quantityMinus = page.locator('button:has-text("-")');
    this.quantityDisplay = page.locator('span.font-mono');
    this.rfqButton = page.locator('a:has-text("Request Wholesale Quote"), a[href*="rfq"]');
  }

  async addToCart() {
    await this.addToCartButton.click();
  }

  async toggleWatchlist() {
    await this.watchlistButton.click();
  }
}
