import { Page, Locator, expect } from '@playwright/test';

/**
 * Parent of every page object. Holds the Playwright `page` and things every page shares
 * (header cart icon, burger menu, logout). Child pages inherit these.
 */
export abstract class BasePage {
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;
  readonly title: Locator;

  /** Each page says which URL it lives at, e.g. '/inventory.html'. */
  protected abstract readonly path: string;

  constructor(protected readonly page: Page) {
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.title = page.getByTestId('title');
  }

  async open(): Promise<void> {
    await this.page.goto(this.path);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(this.path.replace('.', '\\.')));
  }

  /** Number shown on the cart icon; 0 when the badge is not shown. */
  async cartCount(): Promise<number> {
    if ((await this.cartBadge.count()) === 0) return 0;
    return Number(await this.cartBadge.textContent());
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
  }
}
