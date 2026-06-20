# Skills — EpiFinder QA Agentic Solution

This file documents every Claude Code skill (slash command) available in this repository, what each one does, when to use it, and how it works.

Skills are defined in `.claude/commands/` (legacy format, fully supported) and are invoked with `/skill-name` in a Claude Code session.

---

## Available Skills

### `/analyze-site`

**File:** `.claude/commands/analyze-site.md`

**Purpose:** Inspect the live EpiFinder website and produce a fully-populated `site.config.json` with real data — nav items, form detection, industry, and feature flags.

**When to use:**
- First time setting up this repo against a new site
- After the target site has been redesigned or relaunched
- When tests start failing due to changed selectors
- When `site.config.json` has empty `expectedNavItems` or blank description

**What it does:**
1. Issues a HEAD request to resolve the canonical URL
2. Navigates the homepage and dismisses cookie banners
3. Extracts all nav links (text + href)
4. Finds the contact form and detects email/name/submit fields
5. Infers industry from page copy
6. Sets `skipVisual` if the site has uncontrollable CSS animations
7. Outputs a complete `site.config.json` and a list of any site issues

**Output:** Updated `site.config.json` + issues checklist + confidence rating (High/Medium/Low)

---

### `/generate-full-suite`

**File:** `.claude/commands/generate-full-suite.md`

**Purpose:** Analyze the live site and generate a complete, production-quality Playwright test suite — page objects, fixtures, and all test categories.

**When to use:**
- After running `/analyze-site` on a new site
- When a major new page or feature has been added to the site
- When the test coverage needs to be rebuilt from scratch

**What it does:**
1. Reads `site.config.json`
2. Fetches and inspects all discoverable pages (homepage, /about, /features, /pricing, /contact, etc.)
3. Plans POM classes — one per discovered page
4. Writes page object classes in `src/pages/`
5. Writes test files in `tests/smoke/`, `tests/navigation/`, `tests/forms/`, `tests/functional/`, `tests/visual/`, `tests/responsive/`
6. Runs `npx tsc --noEmit` to verify everything compiles

**Output:** Summary of pages analyzed, classes created, test count per suite, and any inaccessible pages

---

### `/run-smoke`

**File:** `.claude/commands/run-smoke.md`

**Purpose:** Run the `@smoke` test suite and display a clean pass/fail summary — suitable for a quick CI gate or pre-commit check.

**When to use:**
- Before opening a PR to verify the site is still reachable
- After updating `site.config.json` to confirm the new URL works
- As the first step in a debugging session

**What it does:**
1. Executes `npm run test:smoke`
2. Parses `test-results/results.json`
3. Displays a formatted table: test name | status | duration
4. Shows failure messages with suggested fixes by failure type
5. Exits with the same code as Playwright (0 = all pass, 1 = any failure)

**Suggested fixes by failure type:**

| Error | Likely Cause | Next Step |
|-------|-------------|-----------|
| HTTP 4xx/5xx | Site down or URL wrong | Check `site.config.json` URL |
| Load timeout | Site too slow / network issue | Check site performance |
| Console errors | JS bug on page | Inspect the errors and file a bug |
| Missing title | Site has no `<title>` tag | Report SEO issue to site owner |

---

### `/update-baseline`

**File:** `.claude/commands/update-baseline.md`

**Purpose:** Capture fresh visual regression screenshots to use as the new baseline after an intentional design change.

**When to use:**
- After a confirmed design update (new colors, layout, fonts, etc.)
- When `@visual` tests fail due to expected design changes, not regressions
- When setting up visual testing for the first time

**What it does:**
1. Runs `npm run baseline` which executes: `playwright test --grep @visual --update-snapshots`
2. Lists all screenshot files that were updated in `__snapshots__/`
3. Reminds you to review screenshots visually before committing
4. Reports any failures during baseline capture

**Important:** Always review updated screenshots before committing — blindly accepting wrong screenshots defeats the purpose of visual regression testing.

**Note:** `__snapshots__/` is in `.gitignore` by default. If you want baselines committed, remove that entry.

---

### `/generate-report`

**File:** `.claude/commands/generate-report.md`

**Purpose:** Parse the last Playwright test run results and display a structured summary report.

**When to use:**
- After any test run to get a summary of results
- In CI to understand failures without reading raw JSON
- When triaging flaky tests

**What it does:**
1. Opens `test-results/results.json`
2. Parses suite-level and test-level results
3. Displays a formatted table: suite | passed | failed | flaky | duration
4. Shows failed test names with their error messages
5. Suggests next steps based on failure patterns (selector broken? site down? new test needed?)

**Note:** In CI environments, skips launching the HTML browser report automatically.

---

## Adding New Skills

To add a new skill, create a markdown file in `.claude/commands/`:

```
.claude/commands/my-skill.md
```

The filename becomes the slash command: `/my-skill`.

For the newer skills format (with subagent support, frontmatter control, and supporting files), use:

```
.claude/skills/my-skill/SKILL.md
```

Both formats are supported by Claude Code. See the [Claude Code Skills documentation](https://code.claude.com/docs/en/skills.md) for full reference.

### Skill File Template

```markdown
# Skill: my-skill

Brief description of what this skill does.

## When to invoke

- List the situations where this skill should be used

## Steps

1. Step one
2. Step two
3. Step three

## Output

Describe what the skill produces or outputs.
```
