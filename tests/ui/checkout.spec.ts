import { test, expect } from '../../src/fixtures/test';
import { PRODUCTS } from '../../test-data/products';
import { MESSAGES } from '../../test-data/messages';
import { newCustomer } from '../../src/utils/dataFactory';
import { round2 } from '../../src/utils/price';

test.describe('Checkout', () => {
  test('end-to-end order with correct totals', { tag: ['@smoke', '@regression', '@e2e'] },
    async ({ inventoryPage, cartPage, checkoutPage }) => {
      let expectedItemPrices: number[] = [];

      await test.step('add two products to the cart', async () => {
        await inventoryPage.open();
        expectedItemPrices = [
          await inventoryPage.priceOf(PRODUCTS.backpack),
          await inventoryPage.priceOf(PRODUCTS.bikeLight),
        ];
        await inventoryPage.addToCart(PRODUCTS.backpack, PRODUCTS.bikeLight);
        await inventoryPage.goToCart();
      });

      await test.step('enter customer information', async () => {
        await cartPage.checkout();
        await checkoutPage.completeInformation(newCustomer());
      });

      await test.step('verify the order summary maths', async () => {
        const s = await checkoutPage.summary();
        expect(s.itemPrices).toEqual(expectedItemPrices);                       // prices carried over
        expect(s.subtotal).toBe(round2(expectedItemPrices.reduce((a, b) => a + b, 0)));
        expect(s.tax).toBeGreaterThan(0);
        expect(s.total).toBe(round2(s.subtotal + s.tax));                       // total = subtotal + tax
      });

      await test.step('place the order', async () => {
        await checkoutPage.finish();
        await expect(checkoutPage.completeHeader).toHaveText(MESSAGES.orderComplete);
        await expect(checkoutPage.cartBadge).toBeHidden();                      // cart emptied
      });
    });

  // Data-driven form validation
  const missingFields = [
    { field: 'first name', data: { lastName: 'Iyer', postalCode: '560001' }, error: MESSAGES.firstNameRequired },
    { field: 'last name', data: { firstName: 'Asha', postalCode: '560001' }, error: MESSAGES.lastNameRequired },
    { field: 'postal code', data: { firstName: 'Asha', lastName: 'Iyer' }, error: MESSAGES.postalCodeRequired },
  ];
  for (const row of missingFields) {
    test(`shows error when ${row.field} is missing`, { tag: '@regression' }, async ({ inventoryPage, cartPage, checkoutPage }) => {
      await inventoryPage.open();
      await inventoryPage.addToCart(PRODUCTS.onesie);
      await inventoryPage.goToCart();
      await cartPage.checkout();
      await checkoutPage.fillInformation(row.data);
      await expect(checkoutPage.error).toHaveText(row.error);
    });
  }

  test('cancel on information step returns to cart', { tag: '@regression' }, async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.open();
    await inventoryPage.addToCart(PRODUCTS.onesie);
    await inventoryPage.goToCart();
    await cartPage.checkout();
    await checkoutPage.cancelButton.click();
    await cartPage.expectLoaded();
    await expect(cartPage.items).toHaveCount(1);
  });
});
