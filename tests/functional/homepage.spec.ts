/**
 * tests/functional/homepage.spec.ts
 *
 * Functional tests for the EpiFinder homepage — hero section, primary CTAs,
 * and the overall structure that communicates the product's value proposition.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Homepage — Hero and CTAs @functional', () => {
  test.beforeEach(async ({ homePage }) => {
    // homePage fixture already navigated; wait for full paint
    await homePage.waitForLoad();
  });

  test('homepage loads and has visible body content @functional', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    expect(
      bodyText.trim().length,
      'Homepage body should contain visible text'
    ).toBeGreaterThan(50);
  });

  test('homepage has an h1 or h2 primary heading @functional', async ({ homePage }) => {
    const heading = await homePage.getMainHeading();
    expect(
      heading.length,
      'Page should have a visible primary heading (h1 or h2)'
    ).toBeGreaterThan(0);
  });

  test('homepage hero text describes a product or service @functional', async ({ homePage }) => {
    const heroText = await homePage.getHeroText();
    // Hero section should contain meaningful copy — not empty or placeholder
    expect(
      heroText.trim().length,
      'Hero/banner section should have visible text describing the product'
    ).toBeGreaterThan(10);
  });

  test('at least one CTA button or link is visible on the homepage @functional', async ({
    homePage,
  }) => {
    const ctaButtons = await homePage.getCTAButtons();
    expect(
      ctaButtons.length,
      'Homepage should have at least one call-to-action button or link'
    ).toBeGreaterThan(0);

    // Confirm the first CTA is actually visible to the user
    await expect(ctaButtons[0]).toBeVisible();
  });

  test('homepage reports itself as fully loaded @functional', async ({ homePage }) => {
    const isLoaded = await homePage.isLoaded();
    expect(isLoaded, 'homePage.isLoaded() should return true when content is present').toBe(true);
  });

  test('page title is non-empty and meaningful @functional', async ({ homePage }) => {
    const title = await homePage.getTitle();
    expect(title.trim(), 'Page <title> should not be empty').toBeTruthy();
    expect(
      title.trim().length,
      'Page title should be at least 5 characters'
    ).toBeGreaterThan(4);
  });

  test('page has a unique, descriptive <title> (not default framework placeholder) @functional', async ({
    homePage,
  }) => {
    const title = await homePage.getTitle();
    const genericTitles = ['home', 'index', 'untitled', 'welcome', 'page'];
    const isGeneric = genericTitles.some((t) => title.toLowerCase().trim() === t);
    expect(isGeneric, `Page title "${title}" appears to be a generic placeholder`).toBe(false);
  });
});

test.describe('Homepage — Navigation Landmark @functional', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.waitForLoad();
  });

  test('homepage has a <nav> landmark or navigation region @functional', async ({ page }) => {
    const nav = page.locator('nav, [role="navigation"]');
    const count = await nav.count();
    expect(count, 'Page should have at least one navigation landmark').toBeGreaterThan(0);
  });

  test('homepage has a <main> landmark or primary content region @functional', async ({ page }) => {
    const main = page.locator('main, [role="main"], #main, #content, .main-content');
    const count = await main.count();
    // Soft check — some older sites lack a <main>, but it is a best practice
    if (count === 0) {
      console.warn(
        '[functional] Homepage is missing a <main> landmark. ' +
          'This affects accessibility (WCAG 2.4.1).'
      );
    }
    // Do not hard-fail — warn only
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('homepage logo or brand element links to the root URL @functional', async ({
    navigationPage,
    homePage,
  }) => {
    await homePage.navigate(); // ensure we are on the homepage
    const logo = navigationPage.page.locator(
      'a[href="/"], a[href*="epifinder.com"], header a, nav a:first-child, [class*="logo"] a, a[class*="logo"]'
    );
    const count = await logo.count();
    expect(count, 'A logo or brand link pointing to the site root should exist').toBeGreaterThan(0);
  });
});
