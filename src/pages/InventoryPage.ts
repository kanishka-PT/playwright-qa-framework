import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { toPrice } from '../utils/price';

export class InventoryPage extends BasePage {
  protected readonly path = '/inventory.html';
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortDropdown = page.getByTestId('product-sort-container');
  }

  /** The product "card" that contains this product name. */
  private item(name: string): Locator {
    return this.items.filter({ hasText: name });
  }

  async addToCart(...names: string[]): Promise<void> {
    for (const name of names) {
      await this.item(name).getByRole('button', { name: 'Add to cart' }).click();
    }
  }

  async removeFromCart(name: string): Promise<void> {
    await this.item(name).getByRole('button', { name: 'Remove' }).click();
  }

  async sortBy(option: string): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async names(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  async prices(): Promise<number[]> {
    return (await this.itemPrices.allTextContents()).map(toPrice);
  }

  async priceOf(name: string): Promise<number> {
    return toPrice(await this.item(name).getByTestId('inventory-item-price').textContent());
  }
}
