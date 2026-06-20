# EpiFinder QA Agentic Solution

Playwright + TypeScript regression test suite for the [EpiFinder](http://www.epifinder.com) website, built on the **Page Object Model (POM)** and **Object-Oriented Programming (OOP)** design patterns. Structured for AI-assisted test generation and maintenance via **Claude Code**.

---

## About EpiFinder

| Field | Details |
|-------|---------|
| **Company** | EpiFinder |
| **Description** | Clinical decision support for the diagnosis of epilepsy |
| **Industry** | Hospitals and Health Care |
| **Founded** | 2014 |
| **Employees** | 1–10 |
| **Funding** | $650K |
| **Location** | Scottsdale, AZ |
| **CEO / Co-Founder** | Robert Yao |

---

## Repository Purpose

This repo contains a production-quality, automated GUI and regression test suite covering every discoverable feature of the EpiFinder marketing/product website. Tests are written without account creation, form submission, or any destructive actions against the target site.

**Test types included:**

| Suite | Tag | What it covers |
|-------|-----|----------------|
| Smoke | `@smoke` | Availability, load time, HTTPS, title/meta |
| Navigation | `@navigation` | Nav links, mobile menu, routing, link health |
| Forms | `@forms` | Field presence, labels, validation (no submission) |
| Functional | `@functional` | Business features: hero, CTAs, content sections, links |
| Visual | `@visual` | Screenshot regression across breakpoints |
| Responsive | `@responsive` | Layout at mobile, tablet, desktop viewports |

---

## Development Environment Setup

### Prerequisites

- **Node.js** v18 or higher (`node --version`)
- **npm** v9 or higher (`npm --version`)
- **Git** (`git --version`)
- **Claude Code** (for AI-assisted test generation — optional but recommended)

### Clone and Install

```bash
git clone <repo-url>
cd epifinder_QA_Agentic_Solution
npm install
npx playwright install --with-deps
```

### Configure the Target Site

```bash
# 1. Review (and update if needed) the site URL and flags
cat site.config.json

# 2. (Optional) Re-analyze the live site and refresh config
#    Run this inside a Claude Code session:
/analyze-site
```

`site.config.json` fields:

| Field | Description |
|-------|-------------|
| `url` | Target site URL — never hardcode this in tests |
| `hasContactForm` | `true` enables @forms test suite |
| `skipVisual` | `true` skips @visual suite (use for heavy-animation sites) |
| `skipForms` | `true` skips @forms suite (use for auth-gated sites) |
| `expectedNavItems` | Array of nav link labels to verify |

### Environment Variables

Copy `.env.example` to `.env` and fill in values if needed:

```bash
cp .env.example .env
```

| Variable | Purpose |
|----------|---------|
| `SITE_URL` | Override site URL without editing `site.config.json` |
| `CI` | Set to `true` in CI environments (disables interactive output) |

---

## Running Tests

```bash
# All tests
npm test

# By suite tag
npm run test:smoke          # @smoke — fast availability gate
npm run test:navigation     # @navigation — nav links and routing
npm run test:forms          # @forms — form field and validation tests
npm run test:visual         # @visual — screenshot regression
npm run test:responsive     # @responsive — viewport layout checks

# Headed browser (useful for local debugging)
npm run test:headed

# Open Playwright UI (interactive test runner)
npx playwright test --ui

# View last HTML report
npm run report

# Update visual regression baselines (after intentional design changes)
npm run baseline
```

### TypeScript and Lint

```bash
npm run typecheck   # tsc --noEmit — must pass before every commit
npm run lint        # ESLint — must pass before every commit
```

---

## Project Structure

```
epifinder_QA_Agentic_Solution/
├── site.config.json            # Target site URL and feature flags
├── playwright.config.ts        # Browser projects: desktop, mobile, tablet
├── CLAUDE.md                   # Claude Code project instructions
├── AGENTS.md                   # Agent definitions and capabilities
├── Skills.md                   # Available slash commands / skills reference
│
├── src/
│   ├── pages/                  # Page Object Model classes
│   │   ├── base.page.ts        # BasePage — shared methods for all pages
│   │   ├── home.page.ts        # HomePage — hero, CTAs, main content
│   │   ├── navigation.page.ts  # NavigationPage — nav links and mobile menu
│   │   ├── contact.page.ts     # ContactFormPage — form discovery and fields
│   │   └── features.page.ts   # FeaturesPage — features, sections, links
│   ├── fixtures/
│   │   └── site.fixture.ts     # Custom Playwright fixtures (page objects + config)
│   ├── types/
│   │   └── site-config.types.ts # SiteConfig interface and loader
│   └── utils/
│       ├── link-checker.ts     # HTTP link health checker
│       └── visual-helper.ts    # Screenshot and viewport utilities
│
├── tests/
│   ├── smoke/
│   │   └── site-availability.spec.ts
│   ├── navigation/
│   │   └── nav-links.spec.ts
│   ├── forms/
│   │   └── contact-form.spec.ts
│   ├── functional/
│   │   ├── homepage.spec.ts         # Hero, CTAs, value proposition
│   │   ├── content-sections.spec.ts # Features, sections, footer
│   │   └── external-links.spec.ts  # Social links, mailto, external targets
│   ├── visual/
│   │   └── visual-regression.spec.ts
│   └── responsive/
│       └── layout.spec.ts
│
├── .claude/
│   ├── commands/               # Slash commands (legacy format — still valid)
│   │   ├── analyze-site.md
│   │   ├── generate-full-suite.md
│   │   ├── generate-report.md
│   │   ├── run-smoke.md
│   │   └── update-baseline.md
│   ├── agents/                 # Custom Claude Code subagents
│   │   ├── site-analyzer.md
│   │   └── test-generator.md
│   └── hooks/
│       └── pre-test.sh         # Site reachability check before test runs
│
└── .github/
    ├── workflows/
    │   ├── playwright.yml      # CI: run full Playwright suite on push/PR
    │   └── claude.yml          # Claude Code GitHub Actions (@claude mentions)
    ├── ISSUE_TEMPLATE/
    │   ├── bug_report.yml
    │   └── test_request.yml
    ├── PULL_REQUEST_TEMPLATE.md
    └── CONTRIBUTING.md
```

---

## Architecture: POM + OOP

### Page Object Model

Every page or major section has exactly one class in `src/pages/`.

```
BasePage (base.page.ts)
  ├── HomePage
  ├── NavigationPage
  ├── ContactFormPage
  └── FeaturesPage
```

**Rules:**
- Page classes `extend BasePage`
- Locators are `readonly Locator` properties defined in the constructor
- Methods represent user actions or data extraction — not assertions
- `expect()` calls belong in test files, never in page objects

### Test Fixture Pattern

Tests import a single `{test, expect}` from `@fixtures/site.fixture.ts`. This provides pre-built page objects and the loaded `SiteConfig` without boilerplate in every test file:

```typescript
import { test, expect } from '@fixtures/site.fixture';

test('hero section is visible @functional', async ({ homePage }) => {
  const heading = await homePage.getMainHeading();
  expect(heading.length).toBeGreaterThan(0);
});
```

### OOP Principles Applied

| Principle | How it's used |
|-----------|---------------|
| **Inheritance** | All page objects extend `BasePage` for shared `navigate()`, `getTitle()`, etc. |
| **Encapsulation** | Locators and interaction logic are private to each page class |
| **Abstraction** | Tests call `homePage.getCTAButtons()` — never `page.locator(...)` directly |
| **Single Responsibility** | One page class per page/section; one spec file per feature area |

---

## Claude Code Integration

This repo is configured for agentic test generation with Claude Code.

### Slash Commands (Skills)

| Command | What it does |
|---------|-------------|
| `/analyze-site` | Crawl the live site and update `site.config.json` |
| `/generate-full-suite` | Generate complete POM + tests from site structure |
| `/run-smoke` | Run smoke tests and show formatted pass/fail summary |
| `/update-baseline` | Capture fresh visual regression screenshots |
| `/generate-report` | Parse test results JSON and show a summary table |

See [Skills.md](Skills.md) for full details on each command.

### Custom Subagents

| Agent | Purpose |
|-------|---------|
| `site-analyzer` | Crawls live site, produces fully-populated `site.config.json` |
| `test-generator` | Reads config and generates site-specific test files |

See [AGENTS.md](AGENTS.md) for full agent specifications.

---

## Contributing

See [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) for the full contributor guide.

**Quick rules:**

1. Run `npm run typecheck && npm run lint` before opening a PR — both must pass
2. Every new test must have at least one tag (`@smoke`, `@functional`, etc.)
3. Never submit forms, create accounts, or hardcode the site URL in tests
4. Page objects own locators and actions; tests own assertions
5. Run the relevant test suite locally before pushing

---

## CI/CD

GitHub Actions runs on every push and pull request to `main`:

- **playwright.yml** — Full Playwright suite across chromium-desktop, mobile-chrome, and tablet
- **claude.yml** — Enables `@claude` mentions in PRs and issues for AI-assisted changes

Test results and HTML reports are uploaded as GitHub Actions artifacts after each run.
