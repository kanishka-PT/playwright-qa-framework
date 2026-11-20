import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { env, AUTH_FILE } from '../../src/utils/env';

/**
 * Runs once before the UI projects. Logs in through the real login form
 * and saves cookies + local storage to .auth/standard-user.json.
 * Every UI test then starts already logged in, which saves time.
 */
setup('log in as standard user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login(env.standardUser, env.uiPassword);
  await expect(page).toHaveURL(/inventory\.html/);
  await page.context().storageState({ path: AUTH_FILE });
});
