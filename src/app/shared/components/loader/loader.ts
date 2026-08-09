import { Component, AfterViewInit, inject, PLATFORM_ID, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GsapService } from '../../../core/services/gsap.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (!isHidden) {
      <div class="fixed inset-0 z-[99999] flex overflow-hidden pointer-events-auto bg-black" #loaderContainer>
        
        <!-- Curtains are commented out per request
        <div class="curtain curtain-left relative w-1/2 h-full shadow-[15px_0_30px_rgba(0,0,0,0.8)] z-20 overflow-hidden" #leftCurtain>
          <div class="absolute top-0 left-0 w-[100vw] h-full">
            <img src="/images/curtain.png" alt="Curtain" class="w-full h-full object-cover" />
          </div>
        </div>

        <div class="curtain curtain-right relative w-1/2 h-full shadow-[-15px_0_30px_rgba(0,0,0,0.8)] z-20 overflow-hidden" #rightCurtain>
          <div class="absolute top-0 right-0 w-[100vw] h-full">
            <img src="/images/curtain.png" alt="Curtain" class="w-full h-full object-cover" />
          </div>
        </div>
        -->

        <!-- Center Logo -->
        <div class="absolute inset-0 flex items-center justify-center z-40 pointer-events-none" #logoContainer>
           <div class="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-accent to-accent-dim flex items-center justify-center shadow-glow">
              <span class="text-bg-primary font-bold text-5xl md:text-7xl font-heading">S</span>
           </div>
        </div>

      </div>
    }
  `,
  styles: `
    .curtain {
      background-color: #3a0000;
    }
  `
})
export class LoaderComponent implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private gsapService = inject(GsapService);
  private cdr = inject(ChangeDetectorRef);
  
  isHidden = false;

  @ViewChild('leftCurtain', { static: false }) leftCurtain!: ElementRef;
  @ViewChild('rightCurtain', { static: false }) rightCurtain!: ElementRef;
  @ViewChild('logoContainer', { static: false }) logoContainer!: ElementRef;
  @ViewChild('loaderContainer', { static: false }) loaderContainer!: ElementRef;

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Wait for everything to settle, then animate out
      setTimeout(() => {
        this.animateOut();
      }, 1200);
    } else {
      this.isHidden = true; // Never show on SSR
    }
  }

  async animateOut() {
    await this.gsapService.init(); 
    const gsap = this.gsapService.gsap;
    if (!gsap) return;

    const tl = gsap.timeline({
      onComplete: () => {
        if (this.loaderContainer) {
          this.loaderContainer.nativeElement.style.display = 'none';
          this.isHidden = true;
          this.cdr.detectChanges();
        }
      }
    });

    // 1. Fade out the logo
    tl.to(this.logoContainer.nativeElement, {
      opacity: 0,
      scale: 1.2,
      duration: 0.6,
      ease: 'power2.inOut'
    });

    // 2. Remove the black background of the loader container early so we can see the site
    tl.set(this.loaderContainer.nativeElement, { backgroundColor: 'transparent' });

    /* 
    // 3. Slide curtains apart
    tl.to(this.leftCurtain.nativeElement, {
      xPercent: -100,
      duration: 1.6,
      ease: 'power3.inOut'
    }, "-=0.2");

    tl.to(this.rightCurtain.nativeElement, {
      xPercent: 100,
      duration: 1.6,
      ease: 'power3.inOut'
    }, "<");
    */
  }
}
