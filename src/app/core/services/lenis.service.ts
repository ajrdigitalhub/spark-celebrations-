import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class LenisService {
  private platformId = inject(PLATFORM_ID);
  private lenis: any;
  private rafId: number | null = null;

  async init(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const { default: Lenis } = await import('lenis');

    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
    });

    // Sync with GSAP ticker if available
    try {
      const { gsap } = await import('gsap');
      gsap.ticker.add((time: number) => {
        this.lenis?.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } catch {
      // Fallback: use requestAnimationFrame
      const raf = (time: number) => {
        this.lenis?.raf(time);
        this.rafId = requestAnimationFrame(raf);
      };
      this.rafId = requestAnimationFrame(raf);
    }
  }

  scrollTo(target: string | number | HTMLElement, options?: any): void {
    this.lenis?.scrollTo(target, options);
  }

  stop(): void {
    this.lenis?.stop();
  }

  start(): void {
    this.lenis?.start();
  }

  destroy(): void {
    this.lenis?.destroy();
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
  }

  get instance(): any {
    return this.lenis;
  }
}
