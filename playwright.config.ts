import { defineConfig, devices } from '@playwright/test';
import { env, AUTH_FILE } from './src/utils/env';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,                       // max time for one test
  expect: { timeout: 7_000 },            // max time an assertion keeps retrying
  fullyParallel: true,                   // run tests in parallel, even inside one file
  forbidOnly: env.isCI,                  // fail CI if someone left test.only in the code
  retries: env.isCI ? 2 : 0,             // retry only on CI, so flaky tests show up locally
  workers: env.isCI ? 2 : undefined,     // undefined = half your CPU cores
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: env.baseUrl,
    testIdAttribute: 'data-test',        // Sauce Demo uses data-test="..." instead of data-testid
    trace: 'on-first-retry',             // full recording when a test is retried
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
  },
  projects: [
    // 1. Logs in once and saves the session to a file
    { name: 'setup', testDir: './tests/setup', testMatch: /.*\.setup\.ts/ },

    // 2. UI tests reuse that saved session, so they start already logged in
    {
      name: 'ui-chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'ui-firefox',
      testDir: './tests/ui',
      use: { ...devices['Desktop Firefox'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'ui-mobile',
      testDir: './tests/ui',
      grep: /@smoke/,
      use: { ...devices['Pixel 7'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },

    // 3. API tests: no browser, different base URL
    { name: 'api', testDir: './tests/api', use: { baseURL: env.apiUrl } },
  ],
});
