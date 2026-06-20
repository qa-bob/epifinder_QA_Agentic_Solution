# Agents — EpiFinder QA Agentic Solution

This file documents the AI agents (subagents) defined in this repository and the overall project conventions any AI agent must follow when working in this codebase.

Claude Code reads `CLAUDE.md` (which imports this file). Other coding agents (Copilot, Cursor, Devin, etc.) should read this file directly.

---

## Project Context for Agents

**What this repo is:** A Playwright + TypeScript regression test suite for the EpiFinder website, using the Page Object Model (POM) architecture and OOP design patterns.

**What the target site is:** EpiFinder — clinical decision support software for epilepsy diagnosis (B2B SaaS, healthcare industry).

**Key constraint:** Tests must never submit forms, create accounts, enter real credentials, or perform any action that could affect the live site.

---

## Mandatory Rules for All Agents

Before writing any code, every agent must:

1. Read `site.config.json` to get the current target URL and feature flags
2. Fetch the live site (`WebFetch` or equivalent) to inspect real HTML before writing selectors
3. Follow the POM pattern — never write `page.locator()` calls directly in test bodies
4. Run `npx tsc --noEmit` to verify TypeScript compiles before reporting task complete
5. Tag every test with at least one of: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`

---

## Architecture Agents Must Follow

### File Locations

| What | Where |
|------|-------|
| Page Object classes | `src/pages/<name>.page.ts` — import via `@pages/` |
| Custom fixtures | `src/fixtures/site.fixture.ts` — import via `@fixtures/` |
| Type definitions | `src/types/` — import via `@app-types/` (NOT `@types/` — that alias conflicts with TypeScript's built-in `@types` resolution) |
| Utility helpers | `src/utils/` — import via `@utils/` |
| Smoke tests | `tests/smoke/` |
| Navigation tests | `tests/navigation/` |
| Form tests | `tests/forms/` |
| Functional tests | `tests/functional/` |
| Visual tests | `tests/visual/` |
| Responsive tests | `tests/responsive/` |

### Page Object Model Contract

```typescript
// Every page object:
// 1. Extends BasePage
// 2. Declares locators as readonly Locator properties
// 3. Methods perform actions / return data — no assertions
// 4. No expect() calls

import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';
import type { SiteConfig } from '@app-types/site-config.types';

export class ExamplePage extends BasePage {
  readonly heading: Locator;

  constructor(page: Page, config: SiteConfig) {
    super(page, config);
    this.heading = page.locator('h1').first();
  }

  async getHeadingText(): Promise<string> {
    return (await this.heading.textContent()) ?? '';
  }
}
```

### Test File Contract

```typescript
// Every test file:
// 1. Imports from @fixtures/site.fixture, not @playwright/test
// 2. Tags test.describe and/or each test with the appropriate @tag
// 3. Uses page object methods — no raw locator calls in test body
// 4. Never submits forms or navigates to auth pages

import { test, expect } from '@fixtures/site.fixture';

test.describe('Feature Area @functional', () => {
  test('describes behavior in plain language @functional', async ({ homePage }) => {
    const heading = await homePage.getMainHeading();
    expect(heading).toBeTruthy();
  });
});
```

---

## Custom Subagents

Two specialized subagents are registered in `.claude/agents/`:

---

### `site-analyzer`

**File:** `.claude/agents/site-analyzer.md`

**Role:** Crawls a live website and produces a fully-populated `site.config.json`. Run this when onboarding a new repo or after the target site has been redesigned.

**Capabilities:**
- Navigate URLs and inspect the live DOM
- Issue HEAD/GET requests to check link status
- Detect nav items, forms, CTAs, and industry keywords
- Set viewport to mobile/tablet/desktop and compare layout
- Dismiss cookie banners before inspection
- Detect auth-gated content without attempting login

**Inputs:**

| Input | Required | Description |
|-------|----------|-------------|
| `url` | Yes | The site URL to analyze |
| `companyName` | No | Override the inferred company name |

**Output:** A valid `site.config.json` with all fields populated, plus an issues checklist.

**Invoke with:** `/analyze-site` in Claude Code, or by describing the task to the `site-analyzer` agent.

---

### `test-generator`

**File:** `.claude/agents/test-generator.md`

**Role:** Reads `site.config.json` and the live site HTML, then generates site-specific Playwright test files that go beyond the generic test templates.

**Capabilities:**
- Parse config and discover site-specific selectors
- Generate TypeScript test files with correct tags and imports
- Apply POM conventions — never raw locators in test body
- Output to `tests/custom/<scenario-name>.spec.ts`

**Inputs:**

| Input | Required | Description |
|-------|----------|-------------|
| `siteConfig` | Yes | Loaded contents of `site.config.json` |
| `testScenarios` | No | List of scenarios to cover |
| `pagesToTest` | No | Specific page URLs to target |

**Invoke with:** `/generate-full-suite` in Claude Code, or by describing the test scenario to the `test-generator` agent.

---

## What Agents Must NOT Do

- Submit any form (no `page.click('button[type=submit]')`)
- Create accounts, sign up, or attempt to log in
- Hardcode the site URL — always read from `site.config.json` or use `baseURL`
- Put `expect()` calls inside page object methods
- Use `page.waitForTimeout()` — use Playwright auto-waiting or `waitForSelector`
- Use `any` type without explicit justification
- Overwrite test baselines without running `/update-baseline` intentionally
- Push commits that fail `npm run typecheck` or `npm run lint`

---

## Asking for Help

If a selector from a previous run no longer matches the live site:

1. Run `/analyze-site` to re-inspect the site and get current selectors
2. Update the relevant page object in `src/pages/`
3. Re-run the affected test suite (`npm run test:functional`, etc.)
4. Commit changes with a message referencing the selector update
