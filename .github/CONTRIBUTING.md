# Contributing to the EpiFinder QA Agentic Solution

Thank you for contributing to this test suite. This guide covers everything you need to know to write, review, and merge changes correctly.

---

## Before You Start

1. Read [README.md](../README.md) to understand the repo's purpose and architecture.
2. Read [AGENTS.md](../AGENTS.md) if you are an AI agent — it contains the mandatory rules for automated contributors.
3. Confirm `site.config.json` points to the correct site URL before writing selectors.

---

## Development Workflow

### 1. Set Up Your Environment

```bash
git clone <repo-url>
cd epifinder_QA_Agentic_Solution
npm install
npx playwright install --with-deps
```

### 2. Create a Feature Branch

```bash
git checkout -b feat/add-homepage-hero-tests
# or
git checkout -b fix/nav-selector-broken
```

### 3. Write or Update Tests

Follow the architecture rules below. Run tests locally before pushing.

### 4. Verify Before Pushing

```bash
npm run typecheck   # Must pass — zero TypeScript errors
npm run lint        # Must pass — zero ESLint errors
npm test            # Full suite (or the relevant subset)
```

### 5. Open a Pull Request

Fill in the [PR template](PULL_REQUEST_TEMPLATE.md). Every PR requires:
- A passing `npm run typecheck`
- A passing `npm run lint`
- A clear description of what changed and why

---

## Architecture Rules

### Page Object Model

**Rule:** Every page or section has exactly one class in `src/pages/`. Tests never call `page.locator()` directly.

```typescript
// ✅ Correct — locator lives in the page object
const heading = await homePage.getMainHeading();
expect(heading).toBeTruthy();

// ❌ Wrong — raw locator in test body
const heading = await page.locator('h1').textContent();
expect(heading).toBeTruthy();
```

**Rule:** Page objects only perform actions and return data — no assertions.

```typescript
// ✅ Correct — method returns data
async getMainHeading(): Promise<string> {
  return (await this.page.locator('h1').first().textContent()) ?? '';
}

// ❌ Wrong — assertion inside page object
async assertHeadingVisible(): Promise<void> {
  await expect(this.page.locator('h1')).toBeVisible(); // belongs in test
}
```

### Test Tags

Every test **must** have at least one tag. Use the correct tag for the content:

| Tag | Use for |
|-----|---------|
| `@smoke` | Site loads, title, no critical errors |
| `@navigation` | Nav links, routing, mobile menu |
| `@forms` | Form fields, labels, validation |
| `@functional` | Business features: hero, CTAs, content sections |
| `@visual` | Screenshot regression |
| `@responsive` | Viewport-specific layout |

### Imports

Always import `{test, expect}` from the custom fixture — not from `@playwright/test`:

```typescript
// ✅ Correct
import { test, expect } from '@fixtures/site.fixture';

// ❌ Wrong — bypasses custom fixtures
import { test, expect } from '@playwright/test';
```

### URLs

Never hardcode the site URL. Always use `baseURL` from Playwright config or read from `siteConfig`:

```typescript
// ✅ Correct — baseURL comes from playwright.config.ts → site.config.json
await page.goto('/contact');

// ✅ Also correct — using siteConfig fixture
await page.goto(siteConfig.url);

// ❌ Wrong — hardcoded URL
await page.goto('https://www.epifinder.com/contact');
```

### Form Safety

**Never submit forms.** Only test field presence, labels, and HTML5 validation attributes.

```typescript
// ✅ Correct — check field exists and has placeholder
await expect(emailField).toBeVisible();
await emailField.fill('test@example.com');
// Do NOT click submit

// ❌ Wrong
await page.click('button[type="submit"]');
```

### Waiting

Never use `page.waitForTimeout()`. Use Playwright's built-in auto-waiting:

```typescript
// ✅ Correct
await page.waitForSelector('.nav-menu');
await expect(navItem).toBeVisible();

// ❌ Wrong
await page.waitForTimeout(2000);
```

---

## Adding a New Page Object

1. Create `src/pages/<name>.page.ts`
2. Extend `BasePage`
3. Declare all locators as `readonly Locator` properties in the constructor
4. Export the class
5. Add the fixture to `src/fixtures/site.fixture.ts` if tests need it pre-built

```typescript
import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';
import type { SiteConfig } from '@types/site-config.types';

export class MyPage extends BasePage {
  readonly heading: Locator;
  readonly ctaButton: Locator;

  constructor(page: Page, config: SiteConfig) {
    super(page, config);
    // Write selectors based on real HTML inspection — not placeholders
    this.heading = page.locator('h1').first();
    this.ctaButton = page.locator('a.btn-primary, button.btn-primary').first();
  }

  async getHeadingText(): Promise<string> {
    return (await this.heading.textContent()) ?? '';
  }
}
```

---

## Visual Regression

When design changes are intentional:

```bash
npm run baseline
# Review screenshots in __snapshots__/ visually before committing
git add __snapshots__/
git commit -m "chore: update visual baselines after design refresh"
```

When a `@visual` test fails unexpectedly, do not update baselines — investigate whether the site changed unintentionally.

---

## AI-Assisted Contributions

This repo is Claude Code-ready. You can use Claude Code to:

- Generate new page objects and tests: `/generate-full-suite`
- Re-analyze the site structure: `/analyze-site`
- Run a quick smoke check: `/run-smoke`
- Get a results summary: `/generate-report`

When Claude Code makes changes, the same rules apply: `npm run typecheck` and `npm run lint` must pass before the PR is ready.

---

## Code Review Standards

Reviewers should check:

1. TypeScript compiles (`npm run typecheck` in CI)
2. All new tests have a tag
3. No raw `page.locator()` in test bodies
4. No hardcoded URLs
5. No form submissions
6. Selectors are based on real HTML (not guessed)
7. Page objects contain no assertions

---

## Questions

Open a [Test Request issue](ISSUE_TEMPLATE/test_request.yml) or tag `@claude` in a PR comment for AI-assisted guidance.
