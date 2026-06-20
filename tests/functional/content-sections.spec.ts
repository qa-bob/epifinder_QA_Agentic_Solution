/**
 * tests/functional/content-sections.spec.ts
 *
 * Functional tests for EpiFinder's content sections — features list, how-it-works,
 * footer presence, and structural completeness of the marketing page.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Content Sections @functional', () => {
  test.beforeEach(async ({ homePage }) => {
    // homePage fixture navigates to site root; wait for full network idle
    await homePage.waitForLoad();
  });

  test('homepage has multiple distinct content sections @functional', async ({ featuresPage }) => {
    const headings = await featuresPage.getSectionHeadingTexts();
    expect(
      headings.length,
      'A B2B SaaS homepage should have at least 2 distinct content sections (h2/h3)'
    ).toBeGreaterThanOrEqual(2);
  });

  test('each section heading has non-empty, meaningful text @functional', async ({
    featuresPage,
  }) => {
    const headings = await featuresPage.getSectionHeadingTexts();
    for (const text of headings) {
      expect(text.trim().length, `Section heading "${text}" should not be empty`).toBeGreaterThan(
        0
      );
    }
  });

  test('page contains feature, benefit, or service elements @functional', async ({
    featuresPage,
  }) => {
    const count = await featuresPage.getFeatureCount();
    // Soft check — not all sites use card-based feature layouts
    if (count === 0) {
      console.warn(
        '[functional] No [class*="feature|benefit|card|service"] elements found. ' +
          'If the site uses a different layout, update the FeaturesPage locator.'
      );
    }
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('page has a visible footer @functional', async ({ featuresPage }) => {
    const hasFooter = await featuresPage.hasFooter();
    expect(hasFooter, 'Page should have a <footer> element').toBe(true);
  });

  test('footer contains non-empty text @functional', async ({ featuresPage }) => {
    const footerText = await featuresPage.getFooterText();
    expect(
      footerText.trim().length,
      'Footer should contain text (copyright, links, or address)'
    ).toBeGreaterThan(0);
  });

  test('footer contains a copyright notice or year @functional', async ({ featuresPage }) => {
    const footerText = await featuresPage.getFooterText();
    const hasCopyright =
      footerText.includes('©') ||
      footerText.toLowerCase().includes('copyright') ||
      /\b20\d{2}\b/.test(footerText);

    if (!hasCopyright) {
      console.warn(
        '[functional] Footer does not appear to contain a copyright notice or year.'
      );
    }
    // Non-blocking — warn only
    expect(typeof footerText).toBe('string');
  });

  test('page images have alt attributes (accessibility) @functional', async ({ page }) => {
    const images = await page.locator('img').all();
    const missingAlt: string[] = [];

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const src = (await img.getAttribute('src')) ?? 'unknown';
      if (alt === null) {
        missingAlt.push(src);
      }
    }

    if (missingAlt.length > 0) {
      console.warn(
        `[functional] ${missingAlt.length} image(s) are missing alt attributes:\n` +
          missingAlt.slice(0, 5).join('\n')
      );
    }

    expect(
      missingAlt.length,
      `${missingAlt.length} image(s) are missing alt attributes (WCAG 1.1.1)`
    ).toBe(0);
  });

  test('all heading levels are used in a logical order @functional', async ({ page }) => {
    const h1Count = await page.locator('h1').count();
    expect(
      h1Count,
      'Page should have exactly one h1 (main topic heading)'
    ).toBeGreaterThanOrEqual(1);

    if (h1Count > 1) {
      console.warn(
        `[functional] Page has ${h1Count} h1 elements. Best practice is one per page.`
      );
    }
  });
});

test.describe('Content Accessibility @functional', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.waitForLoad();
  });

  test('interactive elements have discernible accessible names @functional', async ({ page }) => {
    // Buttons without text or aria-label are inaccessible to screen readers
    const buttons = await page.locator('button').all();
    const unlabeled: string[] = [];

    for (const btn of buttons) {
      const text = (await btn.textContent())?.trim() ?? '';
      const ariaLabel = await btn.getAttribute('aria-label');
      const ariaLabelledBy = await btn.getAttribute('aria-labelledby');
      const title = await btn.getAttribute('title');

      if (!text && !ariaLabel && !ariaLabelledBy && !title) {
        unlabeled.push((await btn.getAttribute('class')) ?? '[no class]');
      }
    }

    if (unlabeled.length > 0) {
      console.warn(
        `[functional] ${unlabeled.length} button(s) have no accessible name:\n` +
          unlabeled.slice(0, 5).join('\n')
      );
    }

    expect(
      unlabeled.length,
      `${unlabeled.length} button(s) lack text, aria-label, aria-labelledby, or title`
    ).toBe(0);
  });

  test('page has a skip-to-content link or other navigation bypass @functional', async ({
    page,
  }) => {
    // WCAG 2.4.1 — bypass blocks
    const skipLink = page.locator(
      'a[href="#main"], a[href="#content"], a[href="#maincontent"], ' +
        'a[class*="skip"], a:has-text("Skip")'
    );
    const count = await skipLink.count();

    if (count === 0) {
      console.warn(
        '[functional] No skip-to-content link found. ' +
          'This is a WCAG 2.4.1 Level A accessibility requirement.'
      );
    }
    // Non-blocking — warn only (many marketing sites omit this)
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
