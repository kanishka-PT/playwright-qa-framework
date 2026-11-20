# Playwright QA Framework (TypeScript)

![Playwright Tests](https://github.com/kanishka-PT/playwright-qa-framework/actions/workflows/playwright.yml/badge.svg)

End-to-end **UI + API** test automation framework built with **Playwright** and **TypeScript**.

- **UI target:** [Sauce Demo](https://www.saucedemo.com), a public practice e-commerce site
- **API target:** [DummyJSON](https://dummyjson.com), a public practice REST API

## What it shows

| Area | How |
|---|---|
| Page Object Model | `src/pages` — one class per page, all extend `BasePage` |
| Custom fixtures | `src/fixtures/test.ts` — tests receive page objects and API clients by name |
| Log in once | `tests/setup/auth.setup.ts` saves the session; UI tests reuse it (`storageState`) |
| UI tests | Login, inventory sorting, cart, full checkout with total calculation |
| Data-driven tests | Invalid logins and checkout form validation run from data tables |
| Network interception | Blocks product images with `page.route` and checks the page still works |
| API tests | GET/POST/PUT/DELETE, pagination, search, 404, auth token chaining |
| Schema validation | JSON Schema check with Ajv (`src/schemas`) |
| Tags | `@smoke`, `@regression`, `@api`, `@e2e` |
| Cross-browser + mobile | Chromium, Firefox, Pixel 7 emulation |
| Reports | HTML report, JUnit XML, screenshots/videos/traces on failure |
| CI/CD | GitHub Actions (sharded, nightly schedule) and Jenkinsfile |

## Project structure

```
playwright-qa-framework/
├── playwright.config.ts      # browsers, projects, retries, reporters, base URLs
├── src/
│   ├── pages/                # Page Objects (BasePage, Login, Inventory, Cart, Checkout)
│   ├── api/                  # API clients (ProductsApi, AuthApi)
│   ├── fixtures/test.ts      # custom fixtures
│   ├── schemas/              # JSON schemas
│   └── utils/                # env config, test data factory, price helpers, schema validator
├── test-data/                # product names, expected messages
├── tests/
│   ├── setup/auth.setup.ts   # logs in once, saves session
│   ├── ui/                   # UI specs
│   └── api/                  # API specs
├── .github/workflows/        # GitHub Actions pipeline
├── Jenkinsfile               # Jenkins pipeline
└── MANUAL.md                 # plain-English guide to every part
```

## Getting started

```bash
npm install
npx playwright install          # downloads the browsers
cp .env.example .env            # optional: change URLs or users
npm test                        # run everything
```

## Useful commands

| Command | What it does |
|---|---|
| `npm test` | Run all projects |
| `npm run test:smoke` | Only tests tagged `@smoke` |
| `npm run test:api` | Only API tests |
| `npm run test:ui` | UI tests in Chromium |
| `npm run test:cross` | UI tests in Chromium + Firefox |
| `npm run test:headed` | Watch the browser while tests run |
| `npm run test:uimode` | Playwright UI mode (pick and re-run tests) |
| `npm run test:debug` | Step through with the inspector |
| `npm run report` | Open the last HTML report |
| `npm run codegen` | Record actions and generate locators |
| `npm run typecheck` | TypeScript compile check |

## CI

- **GitHub Actions:** runs on push/PR to `main`, weekday nights, or manually with a tag filter. Splits tests across 2 machines (sharding) and uploads the reports as artifacts.
- **Jenkins:** `Jenkinsfile` with parameters for suite tag, project and base URL; publishes the JUnit and HTML reports.

See **[MANUAL.md](MANUAL.md)** for a step-by-step explanation of every part, and the roadmap for next steps.
