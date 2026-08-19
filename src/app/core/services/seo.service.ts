import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

interface SeoConfig {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);

  private readonly siteName = 'Spark Celebrations';

  updateMeta(config: SeoConfig): void {
    const fullTitle = config.title
      ? (config.title === this.siteName ? this.siteName : `${config.title} | ${this.siteName}`)
      : this.siteName;

    // Title
    this.title.setTitle(fullTitle);

    // Meta Description
    if (config.description) {
      this.meta.updateTag({ name: 'description', content: config.description });
    }

    // Keywords
    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }

    // Robots
    if (config.noIndex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    }

    // OpenGraph
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:type', content: config.ogType || 'website' });
    if (config.description) {
      this.meta.updateTag({ property: 'og:description', content: config.description });
    }
    if (config.ogImage) {
      this.meta.updateTag({ property: 'og:image', content: config.ogImage });
    }
    this.meta.updateTag({ property: 'og:site_name', content: this.siteName });

    // Twitter Cards
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    if (config.description) {
      this.meta.updateTag({ name: 'twitter:description', content: config.description });
    }
    if (config.ogImage) {
      this.meta.updateTag({ name: 'twitter:image', content: config.ogImage });
    }

    // Canonical URL
    if (config.canonicalUrl) {
      this.updateCanonical(config.canonicalUrl);
    }
  }

  private updateCanonical(url: string): void {
    let link: HTMLLinkElement | null = this.doc.querySelector('link[rel="canonical"]');
    if (link) {
      link.setAttribute('href', url);
    } else {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', url);
      this.doc.head.appendChild(link);
    }
  }

  addJsonLd(schema: object): void {
    // Remove existing JSON-LD scripts
    const existing = this.doc.querySelectorAll('script[type="application/ld+json"]');
    existing.forEach((el) => el.remove());

    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    this.doc.head.appendChild(script);
  }

  setOrganizationSchema(): void {
    this.addJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Spark Celebrations',
      description: 'Premium party theatre booking platform for birthdays, baby showers, and special events.',
      url: 'https://sparkcelebrations.com',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-9990863647',
        contactType: 'customer service',
      },
    });
  }
}
