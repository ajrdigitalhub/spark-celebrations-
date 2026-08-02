import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class GsapService {
  private platformId = inject(PLATFORM_ID);
  private gsapModule: any;
  private scrollTriggerModule: any;
  private initialized = false;

  async init(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this.initialized) return;

    const gsapImport = await import('gsap');
    const scrollTriggerImport = await import('gsap/ScrollTrigger');

    this.gsapModule = gsapImport.gsap || gsapImport.default;
    this.scrollTriggerModule = scrollTriggerImport.ScrollTrigger || scrollTriggerImport.default;

    this.gsapModule.registerPlugin(this.scrollTriggerModule);
    this.initialized = true;
  }

  get gsap(): any {
    return this.gsapModule;
  }

  get ScrollTrigger(): any {
    return this.scrollTriggerModule;
  }

  /** Animate element with scroll-triggered reveal */
  scrollReveal(
    element: HTMLElement,
    options?: {
      y?: number;
      opacity?: number;
      duration?: number;
      delay?: number;
      ease?: string;
      scale?: number;
      filter?: string;
    }
  ): void {
    if (!this.gsapModule) return;

    const {
      y = 60,
      opacity = 0,
      duration = 1,
      delay = 0,
      ease = 'power3.out',
      scale,
      filter,
    } = options || {};

    const fromVars: any = { y, opacity, duration, delay, ease };
    if (scale !== undefined) fromVars.scale = scale;
    if (filter) fromVars.filter = filter;

    this.gsapModule.from(element, {
      ...fromVars,
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        end: 'bottom 20%',
        toggleActions: 'play none none none',
      },
    });
  }

  /** Stagger animate multiple elements */
  staggerReveal(
    elements: HTMLElement[],
    options?: {
      y?: number;
      stagger?: number;
      duration?: number;
      ease?: string;
    }
  ): void {
    if (!this.gsapModule || elements.length === 0) return;

    const { y = 60, stagger = 0.15, duration = 0.8, ease = 'power3.out' } = options || {};

    this.gsapModule.from(elements, {
      y,
      opacity: 0,
      duration,
      stagger,
      ease,
      scrollTrigger: {
        trigger: elements[0],
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  }

  /** Create a parallax effect */
  parallax(element: HTMLElement, speed: number = 0.3): void {
    if (!this.gsapModule) return;

    this.gsapModule.to(element, {
      yPercent: -20 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  /** Cleanup all ScrollTrigger instances */
  killAll(): void {
    this.scrollTriggerModule?.getAll().forEach((st: any) => st.kill());
  }

  /** Refresh ScrollTrigger calculations */
  refresh(): void {
    this.scrollTriggerModule?.refresh();
  }
}
