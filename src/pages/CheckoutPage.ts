import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { Customer } from '../utils/dataFactory';
import { toPrice } from '../utils/price';

/**
 * Sauce Demo checkout has three screens:
 *   step one (your information) -> step two (overview + totals) -> complete.
 * One page object covers all three because they form one flow.
 */
export class CheckoutPage extends BasePage {
  protected readonly path = '/checkout-step-one.html';
  // Step one
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly error: Locator;
  // Step two
  readonly itemPrices: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;
  // Complete
  readonly completeHeader: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
    this.error = page.getByTestId('error');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    this.completeHeader = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  async fillInformation(c: Partial<{ firstName: string; lastName: string; postalCode: string }>): Promise<void> {
    if (c.firstName !== undefined) await this.firstName.fill(c.firstName);
    if (c.lastName !== undefined) await this.lastName.fill(c.lastName);
    if (c.postalCode !== undefined) await this.postalCode.fill(c.postalCode);
    await this.continueButton.click();
  }

  async completeInformation(customer: Customer): Promise<void> {
    await this.fillInformation(customer);
    await expect(this.page).toHaveURL(/checkout-step-two/);
  }

  async summary(): Promise<{ itemPrices: number[]; subtotal: number; tax: number; total: number }> {
    return {
      itemPrices: (await this.itemPrices.allTextContents()).map(toPrice),
      subtotal: toPrice(await this.subtotal.textContent()),
      tax: toPrice(await this.tax.textContent()),
      total: toPrice(await this.total.textContent()),
    };
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
