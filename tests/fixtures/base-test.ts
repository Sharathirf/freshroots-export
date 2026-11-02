import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { ProductDetailPage } from '../pages/product-detail.page';
import { CartPage } from '../pages/cart.page';
import { RfqPage } from '../pages/rfq.page';
import { WatchlistPage } from '../pages/watchlist.page';
import { AdminPage } from '../pages/admin.page';

type TestFixtures = {
  homePage: HomePage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  rfqPage: RfqPage;
  watchlistPage: WatchlistPage;
  adminPage: AdminPage;
};

export const test = base.extend<TestFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  rfqPage: async ({ page }, use) => {
    await use(new RfqPage(page));
  },
  watchlistPage: async ({ page }, use) => {
    await use(new WatchlistPage(page));
  },
  adminPage: async ({ page }, use) => {
    await use(new AdminPage(page));
  },
});

export { expect };
