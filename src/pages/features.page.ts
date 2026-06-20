import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';
import type { SiteConfig } from '@app-types/site-config.types';

export class FeaturesPage extends BasePage {
  readonly heroSection: Locator;
  readonly ctaLinks: Locator;
  readonly featureCards: Locator;
  readonly sectionHeadings: Locator;
  readonly footer: Locator;
  readonly socialLinks: Locator;
  readonly emailLinks: Locator;
  readonly externalLinks: Locator;

  constructor(page: Page, config: SiteConfig) {
    super(page, config);

    // Hero / above-the-fold area
    this.heroSection = page
      .locator('[class*="hero"], [class*="banner"], [id*="hero"], [class*="jumbotron"]')
      .first();

    // Prominent CTA buttons or links
    this.ctaLinks = page.locator(
      'a[class*="btn"], a[class*="cta"], a[class*="button"], ' +
        'button[class*="btn"], button[class*="cta"]'
    );

    // Feature / benefit / service cards or list items
    this.featureCards = page.locator(
      '[class*="feature"], [class*="benefit"], [class*="card"], [class*="service"]'
    );

    // Section-level headings (h2/h3 inside content areas)
    this.sectionHeadings = page.locator(
      'section h2, section h3, main > h2, main > h3, article h2, [class*="content"] h2'
    );

    // Page footer
    this.footer = page.locator('footer');

    // Social media platform links
    this.socialLinks = page.locator(
      'a[href*="linkedin.com"], a[href*="twitter.com"], a[href*="x.com"], ' +
        'a[href*="facebook.com"], a[href*="instagram.com"], a[href*="youtube.com"]'
    );

    // Mailto links
    this.emailLinks = page.locator('a[href^="mailto:"]');

    // All external links (different origin)
    this.externalLinks = page.locator('a[href^="http"]:not([href*="epifinder.com"])');
  }

  /** Text content of all visible section-level headings. */
  async getSectionHeadingTexts(): Promise<string[]> {
    const headings = await this.sectionHeadings.all();
    const texts: string[] = [];
    for (const h of headings) {
      const text = await h.textContent();
      if (text?.trim()) texts.push(text.trim());
    }
    return texts;
  }

  /** Number of feature / benefit / card elements found. */
  async getFeatureCount(): Promise<number> {
    return this.featureCards.count();
  }

  /** Subset of CTA links that are currently visible in the viewport. */
  async getVisibleCTAs(): Promise<Locator[]> {
    const all = await this.ctaLinks.all();
    const visible: Locator[] = [];
    for (const cta of all) {
      if (await cta.isVisible()) visible.push(cta);
    }
    return visible;
  }

  /** True if a footer element exists on the page. */
  async hasFooter(): Promise<boolean> {
    return (await this.footer.count()) > 0;
  }

  /** True if at least one social media link exists. */
  async hasSocialLinks(): Promise<boolean> {
    return (await this.socialLinks.count()) > 0;
  }

  /** True if at least one mailto: link exists. */
  async hasEmailLink(): Promise<boolean> {
    return (await this.emailLinks.count()) > 0;
  }

  /** Full text content of the footer, or empty string if none. */
  async getFooterText(): Promise<string> {
    if ((await this.footer.count()) === 0) return '';
    return (await this.footer.first().textContent()) ?? '';
  }

  /**
   * Returns all external links that are missing `rel="noopener"` or
   * `rel="noreferrer"` when they open in a new tab.
   * These are security/SEO best-practice issues.
   */
  async getUnsafeExternalLinks(): Promise<Array<{ href: string; rel: string | null }>> {
    const links = await this.externalLinks.all();
    const unsafe: Array<{ href: string; rel: string | null }> = [];
    for (const link of links) {
      const target = await link.getAttribute('target');
      const rel = await link.getAttribute('rel');
      const href = (await link.getAttribute('href')) ?? '';
      if (target === '_blank' && !rel?.includes('noopener') && !rel?.includes('noreferrer')) {
        unsafe.push({ href, rel });
      }
    }
    return unsafe;
  }
}
