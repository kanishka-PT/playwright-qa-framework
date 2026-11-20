import { test, expect } from '../../src/fixtures/test';
import { PRODUCTS } from '../../test-data/products';

test.describe('Cart', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.open();
    await inventoryPage.addToCart(PRODUCTS.backpack, PRODUCTS.fleeceJacket);
    await inventoryPage.goToCart();
  });

  test('cart lists the added products', { tag: ['@smoke', '@regression'] }, async ({ cartPage }) => {
    await cartPage.expectLoaded();
    expect(await cartPage.names()).toEqual([PRODUCTS.backpack, PRODUCTS.fleeceJacket]);
  });

  test('remove a product from the cart', { tag: '@regression' }, async ({ cartPage }) => {
    await cartPage.remove(PRODUCTS.backpack);
    await expect(cartPage.items).toHaveCount(1);
    await expect(cartPage.cartBadge).toHaveText('1');
  });

  test('cart keeps items after page reload', { tag: '@regression' }, async ({ cartPage, page }) => {
    await page.reload();
    await expect(cartPage.items).toHaveCount(2);
  });

  test('continue shopping goes back to products', { tag: '@regression' }, async ({ cartPage, inventoryPage }) => {
    await cartPage.continueShoppingButton.click();
    await inventoryPage.expectLoaded();
  });
});
