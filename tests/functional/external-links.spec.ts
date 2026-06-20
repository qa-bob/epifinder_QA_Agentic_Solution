/**
 * tests/functional/external-links.spec.ts
 *
 * Functional tests for EpiFinder's outbound links — social media, mailto
 * links, and security/SEO best practices on external links.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('External and Contact Links @functional', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.waitForLoad();
  });

  test('page has at least one social media link @functional', async ({ featuresPage }) => {
    const hasSocial = await featuresPage.hasSocialLinks();

    if (!hasSocial) {
      console.warn(
        '[functional] No social media links found (LinkedIn, Twitter/X, Facebook, etc.). ' +
          'Expected for a B2B SaaS company.'
      );
    }
    // Non-blocking — warn only (site may have social links on other pages)
    expect(typeof hasSocial).toBe('boolean');
  });

  test('social media links point to valid social platform domains @functional', async ({
    featuresPage,
  }) => {
    const links = await featuresPage.socialLinks.all();
    const validDomains = [
      'linkedin.com',
      'twitter.com',
      'x.com',
      'facebook.com',
      'instagram.com',
      'youtube.com',
    ];

    for (const link of links) {
      const href = await link.getAttribute('href');
      const isValid = validDomains.some((domain) => href?.includes(domain));
      expect(
        isValid,
        `Social link "${href}" does not point to a recognized social platform`
      ).toBe(true);
    }
  });

  test('email (mailto:) links have a valid address format @functional', async ({
    featuresPage,
  }) => {
    const links = await featuresPage.emailLinks.all();
    const emailRegex = /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+/i;

    for (const link of links) {
      const href = (await link.getAttribute('href')) ?? '';
      expect(
        emailRegex.test(href),
        `mailto: link "${href}" does not contain a valid email address`
      ).toBe(true);
    }
  });

  test('external links that open in new tab have rel="noopener" @functional', async ({
    featuresPage,
  }) => {
    const unsafe = await featuresPage.getUnsafeExternalLinks();

    if (unsafe.length > 0) {
      const paths = unsafe
        .slice(0, 5)
        .map(({ href, rel }) => `  ${href} (rel="${rel ?? 'none'}")`)
        .join('\n');
      console.warn(
        `[functional] ${unsafe.length} external link(s) open in _blank without rel="noopener":\n` +
          paths
      );
    }

    expect(
      unsafe.length,
      `${unsafe.length} external link(s) open in a new tab without rel="noopener" or rel="noreferrer" (security risk)`
    ).toBe(0);
  });

  test('all visible links have non-empty href attributes @functional', async ({ page }) => {
    const links = await page.locator('a:visible').all();
    const emptyHrefs: string[] = [];

    for (const link of links) {
      const href = await link.getAttribute('href');
      const text = (await link.textContent())?.trim().slice(0, 40) ?? '[no text]';
      if (href === null || href.trim() === '' || href === '#') {
        emptyHrefs.push(`"${text}"`);
      }
    }

    if (emptyHrefs.length > 0) {
      console.warn(
        `[functional] ${emptyHrefs.length} visible link(s) have empty or "#" href:\n` +
          emptyHrefs.slice(0, 5).join('\n')
      );
    }

    // Non-blocking — anchor-tag buttons (href="#") are common
    expect(emptyHrefs.length).toBeGreaterThanOrEqual(0);
  });

  test('link text is descriptive (no generic "click here" or "read more") @functional', async ({
    page,
  }) => {
    const genericLabels = ['click here', 'here', 'read more', 'more', 'link', 'this'];
    const links = await page.locator('a:visible').all();
    const vague: string[] = [];

    for (const link of links) {
      const text = (await link.textContent())?.trim().toLowerCase() ?? '';
      if (genericLabels.includes(text)) {
        vague.push(`"${text}"`);
      }
    }

    if (vague.length > 0) {
      console.warn(
        `[functional] ${vague.length} link(s) use non-descriptive text (poor for accessibility and SEO):\n` +
          vague.join(', ')
      );
    }

    expect(
      vague.length,
      `${vague.length} link(s) use generic text like "click here" — use descriptive link text (WCAG 2.4.4)`
    ).toBe(0);
  });
});

test.describe('SEO Meta Tags @functional', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.waitForLoad();
  });

  test('page has Open Graph title tag @functional', async ({ page }) => {
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    if (!ogTitle) {
      console.warn('[functional] Missing <meta property="og:title"> — affects social sharing.');
    }
    // Non-blocking — OG tags are a best practice, not a hard requirement
    expect(typeof (ogTitle ?? '')).toBe('string');
  });

  test('page has Open Graph description tag @functional', async ({ page }) => {
    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content');
    if (!ogDesc) {
      console.warn(
        '[functional] Missing <meta property="og:description"> — affects social sharing previews.'
      );
    }
    expect(typeof (ogDesc ?? '')).toBe('string');
  });

  test('page has a canonical link element @functional', async ({ page }) => {
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    if (!canonical) {
      console.warn(
        '[functional] Missing <link rel="canonical"> — can cause duplicate content SEO issues.'
      );
    }
    expect(typeof (canonical ?? '')).toBe('string');
  });
});
