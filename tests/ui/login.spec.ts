import { test, expect } from '../../src/fixtures/test';
import { env } from '../../src/utils/env';
import { MESSAGES } from '../../test-data/messages';

// Login tests must start logged OUT, so they ignore the saved session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('standard user can log in', { tag: ['@smoke', '@regression'] }, async ({ loginPage, inventoryPage }) => {
    await loginPage.login(env.standardUser, env.uiPassword);
    await inventoryPage.expectLoaded();
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('locked out user sees an error', { tag: '@regression' }, async ({ loginPage, page }) => {
    await loginPage.login(env.lockedUser, env.uiPassword);
    await loginPage.expectError(MESSAGES.lockedOut);
    await expect(page).not.toHaveURL(/inventory/);
  });

  // Data-driven: one test definition, several input rows
  const invalidLogins = [
    { title: 'wrong password', user: env.standardUser, pass: 'wrong_pass', error: MESSAGES.wrongPassword },
    { title: 'empty username', user: '', pass: env.uiPassword, error: MESSAGES.usernameRequired },
    { title: 'empty password', user: env.standardUser, pass: '', error: MESSAGES.passwordRequired },
  ];
  for (const row of invalidLogins) {
    test(`shows error for ${row.title}`, { tag: '@regression' }, async ({ loginPage }) => {
      await loginPage.login(row.user, row.pass);
      await loginPage.expectError(row.error);
    });
  }

  test('user can log out', { tag: '@regression' }, async ({ loginPage, inventoryPage, page }) => {
    await loginPage.login(env.standardUser, env.uiPassword);
    await inventoryPage.logout();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });
});
