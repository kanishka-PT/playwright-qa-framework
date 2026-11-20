import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { ProductsApi } from '../api/ProductsApi';
import { AuthApi } from '../api/AuthApi';

/**
 * Custom fixtures: tests ask for what they need by name, e.g. `async ({ inventoryPage }) => ...`
 * and Playwright creates it for that test. No `new LoginPage(page)` boilerplate in tests.
 */
type Fixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  productsApi: ProductsApi;
  authApi: AuthApi;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  inventoryPage: async ({ page }, use) => { await use(new InventoryPage(page)); },
  cartPage: async ({ page }, use) => { await use(new CartPage(page)); },
  checkoutPage: async ({ page }, use) => { await use(new CheckoutPage(page)); },
  productsApi: async ({ request }, use) => { await use(new ProductsApi(request)); },
  authApi: async ({ request }, use) => { await use(new AuthApi(request)); },
});

export { expect };
