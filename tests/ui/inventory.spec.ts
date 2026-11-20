import { test, expect } from '../../src/fixtures/test';
import { PRODUCTS, SORT } from '../../test-data/products';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.open();
  });

  test('shows 6 products with prices', { tag: ['@smoke', '@regression'] }, async ({ inventoryPage }) => {
    await expect(inventoryPage.items).toHaveCount(6);
    const prices = await inventoryPage.prices();
    expect(prices.every(p => p > 0)).toBeTruthy();
  });

  test('sort by price low to high', { tag: '@regression' }, async ({ inventoryPage }) => {
    await inventoryPage.sortBy(SORT.priceLowHigh);
    const prices = await inventoryPage.prices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sort by price high to low', { tag: '@regression' }, async ({ inventoryPage }) => {
    await inventoryPage.sortBy(SORT.priceHighLow);
    const prices = await inventoryPage.prices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('sort by name Z to A', { tag: '@regression' }, async ({ inventoryPage }) => {
    await inventoryPage.sortBy(SORT.nameDesc);
    const names = await inventoryPage.names();
    expect(names).toEqual([...names].sort().reverse());
  });

  test('add and remove items updates cart badge', { tag: ['@smoke', '@regression'] }, async ({ inventoryPage }) => {
    await inventoryPage.addToCart(PRODUCTS.backpack, PRODUCTS.bikeLight);
    await expect(inventoryPage.cartBadge).toHaveText('2');

    await inventoryPage.removeFromCart(PRODUCTS.backpack);
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.removeFromCart(PRODUCTS.bikeLight);
    await expect(inventoryPage.cartBadge).toBeHidden();
  });

  test('page still works when product images fail to load', { tag: '@regression' }, async ({ page, inventoryPage }) => {
    // Network interception: block every image request, then check the page is still usable
    await page.route(/\.(png|jpg|jpeg|svg|webp)(\?.*)?$/, route => route.abort());
    await page.reload();
    await expect(inventoryPage.items).toHaveCount(6);
    await inventoryPage.addToCart(PRODUCTS.onesie);
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });
});
