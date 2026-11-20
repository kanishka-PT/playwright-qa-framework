# Framework Manual: What Was Built, in Plain English

This manual walks through the framework one piece at a time: what each file does, why it exists, and how to explain it in an interview. The last sections cover how to run it, how to put it on GitHub, and what to build next.

---

## 1. The big picture

A test automation framework is a project that holds your automated tests **plus the structure around them**: shared code, configuration, test data, reports and a way to run everything automatically.

This framework tests two public practice websites:

- **Sauce Demo** (`saucedemo.com`): a fake online shop with login, a product list, cart and checkout. It is made for practising automation.
- **DummyJSON** (`dummyjson.com`): a fake REST API with products and login. It is made for practising API testing.

How a test run works:

```
npm test
  │
  ├─ 1. "setup" project: opens the browser, logs in once, saves the session to a file
  │
  ├─ 2. UI projects (Chrome, Firefox, mobile): every UI test starts already logged in,
  │      uses page objects to click and check things
  │
  ├─ 3. API project: no browser; sends HTTP requests and checks the responses
  │
  └─ 4. Reports: HTML report, JUnit XML for CI, plus screenshots/videos/traces of failures
```

**57 tests in total:** 21 UI tests × 2 desktop browsers, 5 smoke tests on mobile, 1 setup and 9 API tests. Run on a local copy of both sites, every Chromium, mobile and API test passed. On your machine, run `npx playwright install` to get Firefox too.

---

## 2. Tools used, and why

| Tool | What it is | Why it is here |
|---|---|---|
| Node.js + npm | JavaScript runtime and package installer | Playwright for TypeScript runs on Node |
| TypeScript | JavaScript with types | Catches mistakes before running, e.g. a wrong method name |
| @playwright/test | Playwright's own test runner | Browsers, assertions, parallel runs, reports, retries |
| dotenv | Reads a `.env` file | Change URLs/users without changing code |
| Ajv | JSON Schema validator | Checks an API response has the right shape |

---

## 3. Files at the root

### `package.json`
The project's ID card. It lists:
- the libraries it needs (`devDependencies`); `npm install` downloads them into `node_modules/`.
- **scripts**, which are short names for long commands. `npm run test:smoke` actually runs `playwright test --grep @smoke`.

### `tsconfig.json`
Settings for the TypeScript compiler. `"strict": true` makes TypeScript strict about types, which catches more mistakes. `npm run typecheck` uses this file to check that all the code compiles.

### `playwright.config.ts`: the control panel
Read this file first. It decides **how** tests run.

| Setting | Plain meaning |
|---|---|
| `testDir: './tests'` | Where the test files are |
| `timeout: 30_000` | A single test fails if it takes longer than 30 seconds |
| `expect.timeout: 7_000` | An assertion like "badge shows 2" keeps retrying for up to 7 seconds before failing |
| `fullyParallel: true` | Tests run at the same time in several workers, which is faster |
| `forbidOnly` | On CI, fail the run if someone accidentally left `test.only` in the code |
| `retries` | On CI a failed test is retried twice; locally it isn't, so you notice flaky tests |
| `workers` | How many tests run at once |
| `reporter` | `list` = console output, `html` = a nice report, `junit` = XML that Jenkins/GitHub understand |
| `baseURL` | The site address. Tests write `/cart.html` instead of the full URL, so switching environments is one change |
| `testIdAttribute: 'data-test'` | Sauce Demo marks elements with `data-test="..."`, so `getByTestId('checkout')` finds `data-test="checkout"` |
| `trace: 'on-first-retry'` | When a test is retried, record everything (DOM, network, console) so you can replay it |
| `screenshot` / `video` | Kept only for failures, which saves space |
| `projects` | Different "runs" with different settings (next section) |

**Projects** let one config run the same tests in different ways:

| Project | What it does |
|---|---|
| `setup` | Logs in once, saves the session |
| `ui-chromium` | All UI tests in Chrome, starting logged in (`storageState`), runs after `setup` (`dependencies`) |
| `ui-firefox` | Same tests in Firefox |
| `ui-mobile` | Only `@smoke` tests on an emulated Pixel 7 phone screen |
| `api` | API tests, using the DummyJSON base URL, no browser |

### `.env.example`
A template for environment settings (URLs, usernames). Copy it to `.env` to override values. `.env` is listed in `.gitignore`, so real secrets never go to GitHub. The demo passwords are public practice values, so the code also has safe defaults.

### `.gitignore`
Tells git which files not to upload: `node_modules` (huge, re-downloadable), reports, test results, `.auth` (saved login sessions), and `.env`.

---

## 4. `src/`: reusable code (not tests)

### 4.1 `src/utils/env.ts`: one place for settings
Reads `.env` and exposes an `env` object (`env.baseUrl`, `env.standardUser`...). Every file imports from here, so nothing is hard-coded across the project. It also defines `AUTH_FILE`, where the saved login session is stored.

*Interview line:* "No hard-coded URLs or credentials; everything comes from environment variables with defaults, so the same tests run against QA or staging by changing `BASE_URL`."

### 4.2 `src/pages/`: Page Object Model (POM)
**Idea:** each screen of the app gets a class. The class knows **where things are** (locators) and **what you can do** (methods). Tests then read like steps: `inventoryPage.addToCart('Sauce Labs Backpack')`.

**Why it matters:** if the "Add to cart" button changes, you fix it in **one** place, the page class, not in 20 tests.

| File | What it contains |
|---|---|
| `BasePage.ts` | Parent class. Holds `page` and things every page has (cart icon, cart badge, menu, logout, title). Methods: `open()`, `expectLoaded()`, `cartCount()`, `goToCart()`, `logout()`. It is `abstract`, so you can't create a "BasePage" directly, only real pages |
| `LoginPage.ts` | Username, password, login button, error message. `login(user, pass)`, `expectError(msg)` |
| `InventoryPage.ts` | Product list. `addToCart(...names)` (accepts several names), `removeFromCart`, `sortBy`, `names()`, `prices()`, `priceOf(name)` |
| `CartPage.ts` | Items in cart, `remove(name)`, `checkout()`, continue shopping |
| `CheckoutPage.ts` | All three checkout screens: form fields, `fillInformation`, `completeInformation`, `summary()` (reads item prices, subtotal, tax, total as numbers), `finish()` |

**OOP inside (good to say in interviews):**
- **Inheritance:** every page `extends BasePage`, so the cart icon and logout are written once.
- **Encapsulation:** locators live inside the class; tests only call methods.
- **Abstraction:** `BasePage` is `abstract` and each page must define its own `path`.

**Locator strategy:** user-facing locators first, `getByRole('button', { name: 'Add to cart' })`, then test IDs, `getByTestId('checkout')`. These are the most stable and are Playwright's recommendation. To find "the Add to cart button **of the Backpack**", the code filters the product card by its text and then finds the button inside it:
```ts
this.items.filter({ hasText: name }).getByRole('button', { name: 'Add to cart' })
```

### 4.3 `src/api/`: API clients
Small classes that wrap HTTP calls, so tests say `productsApi.getProduct(1)` instead of building URLs.
- `ProductsApi.ts`: get, list (with `limit`/`skip` for pagination), search, add (POST), update (PUT), delete.
- `AuthApi.ts`: `login`, `me` (needs a token), and `token()`, which logs in and returns just the token.

This is the same idea as page objects, applied to APIs.

### 4.4 `src/fixtures/test.ts`: custom fixtures
**Fixture** = something a test needs, prepared by Playwright automatically. Built-in fixtures are `page`, `request`, `context` and `browser`.

This file **adds** our own: `loginPage`, `inventoryPage`, `cartPage`, `checkoutPage`, `productsApi`, `authApi`. A test just lists what it wants:
```ts
test('...', async ({ inventoryPage, cartPage }) => { ... })
```
and Playwright creates them fresh for that test. Tests import `test` and `expect` from this file instead of from `@playwright/test`.

*Interview line:* "Fixtures give dependency injection. Tests declare what they need, and setup and teardown live in one place."

### 4.5 `src/schemas/` and `src/utils/schema.ts`: schema validation
`product.schema.ts` describes what a product **must** look like: `id` is an integer, `title` is a non-empty string, `price` is above 0, and so on. `schemaErrors()` uses Ajv to compare a real response with the schema and returns a readable list of problems; an empty list means valid.

Why: value checks (`price > 0`) don't notice when a field is renamed or missing. Schema checks catch **contract** changes.

### 4.6 `src/utils/dataFactory.ts` and `price.ts`
- `newCustomer()` creates random first name, last name and postal code for checkout, so tests don't depend on fixed data. `uniqueTitle()` adds a timestamp so names are unique.
- `toPrice("$29.99")` turns text into the number 29.99. `round2()` fixes floating-point noise (0.1 + 0.2 = 0.30000000000000004 in JavaScript).

---

## 5. `test-data/`
- `products.ts`: product names exactly as on the site, plus sort option values.
- `messages.ts`: the exact error and success messages expected.

Keeping data out of tests means one edit when the site text changes, and tests stay readable (`MESSAGES.lockedOut` rather than a long string).

---

## 6. `tests/`: the tests themselves

### 6.1 `tests/setup/auth.setup.ts`: log in once
It opens the login page, logs in as `standard_user`, checks that the products page opened, then **saves cookies and local storage to `.auth/standard-user.json`**.

UI projects use `storageState: AUTH_FILE`, so every UI test starts **already logged in**. That saves time (no login in 30 tests) and keeps tests focused. This is the most common Playwright interview question on authentication.

### 6.2 `tests/ui/login.spec.ts`
These tests need to start **logged out**, so the file starts with:
```ts
test.use({ storageState: { cookies: [], origins: [] } });   // empty session
```
| Test | What it checks |
|---|---|
| standard user can log in | Lands on products page, title "Products" (`@smoke`) |
| locked out user sees an error | Exact error text, stays on login page |
| shows error for wrong password / empty username / empty password | **Data-driven**: one `for` loop over 3 rows makes 3 tests |
| user can log out | Menu → Logout → back to the login page |

`test.beforeEach` opens the login page before every test in the file.

### 6.3 `tests/ui/inventory.spec.ts`
| Test | What it checks |
|---|---|
| shows 6 products with prices | Count = 6 and all prices > 0 |
| sort by price low→high / high→low / name Z→A | Reads the prices/names after sorting, compares them with a sorted copy |
| add and remove items updates cart badge | Badge shows 2 → 1 → disappears |
| page still works when images fail | **Network interception**: `page.route(...)` aborts every image request, then the test checks products still list and add to cart still works |

The sorting check is a classic interview task:
```ts
const prices = await inventoryPage.prices();
expect(prices).toEqual([...prices].sort((a, b) => a - b));
```

### 6.4 `tests/ui/cart.spec.ts`
`beforeEach` adds two products and opens the cart. The tests check: correct items listed, removing one, items survive a page reload, and "continue shopping" goes back.

### 6.5 `tests/ui/checkout.spec.ts`: the end-to-end test
The main flow is split into **`test.step`** blocks, which show as named steps in the report:
1. Add Backpack + Bike Light, **remembering their prices from the product page**.
2. Go to cart → checkout → fill random customer details.
3. **Verify the maths:** prices carried over correctly; subtotal = sum of prices; tax > 0; total = subtotal + tax.
4. Finish → "Thank you for your order!" and the cart badge disappears.

It also includes data-driven checks for the three required fields on the form and a cancel test.

*Why this matters for you:* it's the same thinking you use at work for order totals and shipping. Calculate the expected value yourself instead of copying the number from the screen.

### 6.6 `tests/api/products.api.spec.ts`
| Test | Concept |
|---|---|
| GET a product by id | Status 200, body values |
| response matches JSON schema | Contract check |
| list supports limit and skip | Pagination |
| search returns matching products | Query parameters |
| unknown product returns 404 | Negative test |
| create, update and delete (CRUD) | POST/PUT/DELETE. DummyJSON *simulates* writes: it answers as if it saved, but doesn't really store anything |

### 6.7 `tests/api/auth.api.spec.ts`
- **Token chaining:** log in → take `accessToken` → call `/auth/me` with `Authorization: Bearer <token>` → check the username. This is the Postman "save token in a variable" idea, done in code.
- Wrong password → 400.
- Fake token → rejected (any 4xx/5xx; a well-designed API returns 401).

### 6.8 Tags
Tests carry tags like `{ tag: ['@smoke', '@regression'] }`.
- `@smoke` = the few critical checks to run after every deploy.
- `@regression` = everything, run nightly.
- `@api`, `@e2e` = by type.

Run a tag with `npx playwright test --grep @smoke`.

---

## 7. Reports and debugging

| Output | Where | Use |
|---|---|---|
| HTML report | `playwright-report/index.html` (`npm run report`) | Pass/fail per test, steps, errors, screenshots, videos, traces |
| JUnit XML | `test-results/junit.xml` | Jenkins/GitHub read this to show test results |
| Trace | inside the report, on retries | Replay a failed test step by step: DOM, network, console |
| Screenshot/video | `test-results/` | Only for failed tests |

**Debugging options:**
- `npm run test:headed` shows the browser while tests run.
- `npm run test:uimode` opens a visual runner: pick tests, watch them, time-travel through steps.
- `npm run test:debug` pauses at each action in the Playwright Inspector.
- `npx playwright show-trace <trace.zip>` opens a saved trace.
- `npm run codegen` records your clicks and suggests locators.

---

## 8. CI/CD files

### `.github/workflows/playwright.yml` (GitHub Actions)
- **When it runs:** every push or pull request to `main`, weekday nights at 08:00 IST (`cron`), or manually from the Actions tab with a tag filter (`workflow_dispatch`).
- **What it does:** checks out the code → installs Node and dependencies (`npm ci`) → installs browsers → type-checks → runs tests → uploads the reports as downloadable artifacts, even when tests fail (`if: always()`).
- **Sharding:** `matrix.shard: [1, 2]` runs half the tests on each of two machines at the same time.
- **Secrets:** shows where a real password would come from (`secrets.UI_PASSWORD`).

### `Jenkinsfile` (Jenkins)
A declarative pipeline with **parameters** (suite tag, project/browser, base URL), a nightly trigger, and stages Install → Type check → Test. Afterwards it publishes the JUnit results and the HTML report in Jenkins. Use it to explain "how I run Playwright from Jenkins" in interviews.

---

## 9. How to run it on your laptop

1. Install **Node.js 20+** (nodejs.org) and **Git**.
2. Unzip the project, open a terminal in the folder.
3. `npm install` downloads the libraries.
4. `npx playwright install` downloads Chromium, Firefox and WebKit.
5. `npm test` runs everything. Then `npm run report` opens the report.
6. Try `npm run test:headed` to watch the browser, and `npm run test:uimode` to explore.

If a test fails because Sauce Demo changed its text or attributes, open `npm run codegen`, find the new locator, and update **only** the page object.

## 10. How to put it on GitHub

```bash
cd playwright-qa-framework
git init                       # the zip already contains one commit; skip if .git exists
git add .
git commit -m "Initial Playwright framework"
# Create an empty repo on github.com named playwright-qa-framework (no README), then:
git remote add origin https://github.com/kanishka-PT/playwright-qa-framework.git
git branch -M main
git push -u origin main
```
Then:
- Open the **Actions** tab; the workflow runs automatically.
- Replace `<your-github-username>` in the README badge URL.
- Pin the repo on your GitHub profile, and add it to LinkedIn **Featured** and your resume.
- Commit improvements over the next weeks (small, meaningful commits look better than one big upload).

---

## 11. What to build next (roadmap)

Each item is something you can show in an interview. Do them roughly in this order, one commit or PR each.

### Level 1: polish (1–2 days)
1. **ESLint + Prettier** with `eslint-plugin-playwright` (catches missing `await`, focused tests). Add a "lint" step in CI.
2. **More negative and edge tests**: `problem_user` and `performance_glitch_user` on Sauce Demo (these users have deliberate bugs/slowness, which makes for good "I found a bug" stories).
3. **Visual regression**: `await expect(page).toHaveScreenshot('inventory.png', { mask: [...] })` and keep baselines in git.
4. **Accessibility**: add `@axe-core/playwright` and fail on serious WCAG violations.

### Level 2: framework depth (3–5 days)
5. **Allure report** (`allure-playwright`) published to GitHub Pages from CI, so you have a public link to show recruiters.
6. **Environment switching**: `.env.qa`, `.env.staging` chosen by `TEST_ENV=qa`.
7. **API + UI combo**: create data through the API, then verify it in the UI (use an app that has both, e.g. your own small app or a practice site with an API).
8. **API mocking for UI states**: `page.route` returning an empty list or a 500 error, and assert the UI shows the right message.
9. **Custom reporter / Slack notification** from CI on failure.
10. **Docker**: run tests in `mcr.microsoft.com/playwright` with a `Dockerfile` and `docker-compose`.

### Level 3: stand out for AI-native QA roles (1–2 weeks)
11. **AI test generation script**: a Node script that sends a user story to an LLM API and writes draft Playwright test cases into `tests/generated/`. A human reviews them before they merge. Document prompts and limits in the README.
12. **Playwright MCP demo**: record a short GIF or write-up of an AI agent (Claude Code or Copilot with Playwright MCP) exploring Sauce Demo and proposing new tests, and how you reviewed them.
13. **AI failure triage**: after a CI run, send failures and error messages to an LLM and post a summary ("likely locator change / likely product bug") as a job summary. Clearly mark it as a suggestion.
14. **BDD layer**: `playwright-bdd` so feature files in Gherkin drive the same page objects.
15. **Performance smoke**: a small k6 or JMeter script against DummyJSON, run weekly in CI, report in the artifacts.

### Level 4: real-world flavour
16. Point the framework at the **NopCommerce demo store** or a local NopCommerce instance in Docker. It matches your work domain, so you can talk about checkout, shipping methods and order data the same way you do at work. (The public NopCommerce demo may block bots; a local Docker instance is more reliable.)
17. Add **SQL validation** against that local NopCommerce database (orders saved with the right shipping method), which mirrors your Nop → POT → legacy testing.

---

## 12. How to present this project in an interview (60 seconds)

"I built a Playwright + TypeScript framework from scratch. It uses the Page Object Model with a shared BasePage and custom fixtures, so tests just ask for the pages they need. A setup project logs in once and saves the session, and UI tests reuse it, which keeps them fast. It covers UI flows like login, sorting, cart and full checkout, where I verify the subtotal, tax and total maths, plus API tests with token chaining and JSON schema validation. Tests are tagged smoke and regression, run in parallel across Chrome, Firefox and mobile emulation, and produce HTML reports and traces on failure. It runs in GitHub Actions with sharding and a nightly schedule, and I've included a Jenkinsfile with parameters. Next I'm adding visual and accessibility checks and an AI-assisted test generation step."

**Questions they may ask about it, with short answers:**
- *Why storageState?* Faster tests; login is tested separately in its own file.
- *How do you avoid flaky tests?* Web-first assertions that auto-retry, role and test-id locators, no fixed waits, isolated contexts, unique data, retries only on CI.
- *How would you add a new page?* Create a class extending BasePage, add it to the fixtures, write the spec.
- *How do you run only smoke tests in CI?* `--grep @smoke` via the workflow input or the Jenkins parameter.
- *How do you handle secrets?* `.env` locally (git-ignored), GitHub Secrets and Jenkins Credentials in CI.
