import { Component, OnInit, inject, signal, PLATFORM_ID, HostListener, ViewEncapsulation } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { Flipbook } from '../../core/models/index';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading';
import { IconComponent } from '../../shared/components/icon/icon.component';

declare var $: any;

@Component({
  selector: 'app-flipbook',
  standalone: true,
  imports: [CommonModule, RouterModule, SectionHeadingComponent, IconComponent],
  encapsulation: ViewEncapsulation.None,
  styles: [`
    .flipbook-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(8px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    .flipbook-modal.active {
      opacity: 1;
      pointer-events: auto;
    }
    
    .flipbook-wrapper {
      position: relative;
      /* The transform will be applied dynamically via style binding */
      transition: transform 0.2s ease;
    }
    
    .flipbook {
      width: 1000px;
      height: 600px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }
    
    .flipbook .page {
      background: white;
      border: 1px solid rgba(0, 0, 0, 0.11);
      overflow: hidden;
      width: 100%;
      height: 100%;
    }
    
    .flipbook .page img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #f8f8f8;
      display: block;
    }

    .close-btn {
      position: absolute;
      top: 20px;
      right: 30px;
      color: white;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 50%;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      z-index: 10000;
    }
    .close-btn:hover {
      background: rgba(255,255,255,0.2);
      transform: scale(1.05);
    }
  `],
  template: `
    <section class="pt-32 pb-section relative min-h-screen flex flex-col justify-center">
      <div class="absolute inset-0">
        <div class="absolute top-40 left-1/3 w-80 h-80 bg-accent/5 rounded-full blur-[100px]"></div>
      </div>
      <div class="section-container relative z-10 text-center">
        <app-section-heading
          badge="Flipbook"
          title="Our Digital"
          highlight="Catalogue"
          subtitle="Browse through our celebrations catalogue."
        />

        @if (loading()) {
          <div class="max-w-md mx-auto mt-8">
            <div class="h-16 skeleton rounded-xl w-full"></div>
          </div>
        }

        @if (flipbookData() && !loading()) {
          <div class="mt-8 flex justify-center">
            <button class="btn-primary text-lg px-8 py-4 shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3" (click)="openFlipbook()">
              <app-icon name="book-open" [size]="24"></app-icon>
              Open Digital Catalogue
            </button>
          </div>
          <p class="text-text-muted text-sm mt-6">Best experienced on desktop or tablet.</p>
        }

        @if (!loading() && !flipbookData()) {
          <div class="text-center py-20 max-w-md mx-auto text-text-muted">
            <div class="flex justify-center mb-6"><app-icon name="book-open" [size]="80"></app-icon></div>
            <h3 class="text-xl font-heading font-semibold mb-3 text-text-primary">Flipbook Coming Soon</h3>
            <p class="text-text-secondary mb-6">
              Our digital catalogue is being prepared. Check back soon to explore our celebration packages.
            </p>
            <a routerLink="/services" class="btn-primary !rounded-xl">
              <span>View Our Services</span>
            </a>
          </div>
        }
      </div>
    </section>

    <!-- Fullscreen Flipbook Modal -->
    <div class="flipbook-modal" [class.active]="isModalOpen()">
      <button class="close-btn" (click)="closeFlipbook()">
        <app-icon name="x" [size]="24"></app-icon>
      </button>

      <div class="flipbook-wrapper" [style.transform]="'scale(' + flipbookScale() + ')'">
        <div class="flipbook" id="flipbookContainer">
          
          <!-- FRONT COVER (Page 1) -->
          <div class="page">
            @if (flipbookData()?.coverImage) {
              <img [src]="getImageUrl(flipbookData()!.coverImage!)" alt="Front Cover" class="w-full h-full object-cover block" />
            } @else {
              <div class="flex flex-col items-center justify-center w-full h-full text-center p-4 bg-[#c0392b] text-white">
                <span class="text-2xl font-bold font-heading">Spark Celebrations</span>
                <small class="italic opacity-80 mt-2 block font-light text-sm">Digital Catalogue</small>
              </div>
            }
          </div>
          
          <!-- INNER PAGES -->
          @if (flipbookData()) {
            @for (img of flipbookData()!.images; track img) {
              <div class="page">
                <img [src]="getImageUrl(img)" alt="Flipbook Page" class="w-full h-full object-cover block" />
              </div>
            }
            
            <!-- BLANK PAGE PADDING (Ensures Back Cover is an Even Page) -->
            @if (flipbookData()!.images.length % 2 !== 0) {
              <div class="page bg-white"></div>
            }
          }

          <!-- BACK COVER (Last Page, Even) -->
          <div class="page">
            @if (flipbookData()?.backCoverImage) {
              <img [src]="getImageUrl(flipbookData()!.backCoverImage!)" alt="Back Cover" class="w-full h-full object-cover block" />
            } @else {
              <div class="flex flex-col items-center justify-center w-full h-full text-center p-4 bg-[#c0392b] text-white">
                <span class="text-xl font-bold font-heading">Thank You</span>
                <small class="italic opacity-80 mt-2 block font-light text-sm">Spark Celebrations</small>
              </div>
            }
          </div>

        </div>
      </div>
    </div>
  `,
})
export class FlipbookComponent implements OnInit {
  private api = inject(ApiService);
  private seo = inject(SeoService);
  private platformId = inject(PLATFORM_ID);

  flipbookData = signal<Flipbook | null>(null);
  loading = signal(true);
  isModalOpen = signal(false);
  flipbookScale = signal(1);

  ngOnInit(): void {
    this.seo.updateMeta({
      title: 'Flipbook',
      description: 'Browse our digital catalogue — explore celebration packages at Spark Celebrations.',
    });

    this.api.getFlipbook().subscribe({
      next: (data) => {
        this.flipbookData.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
  
  openFlipbook() {
    this.isModalOpen.set(true);
    this.calculateScale();
    
    if (isPlatformBrowser(this.platformId)) {
      // Prevent body scrolling
      document.body.style.overflow = 'hidden';
      
      setTimeout(() => this.initFlipbook(), 100);
    }
  }

  closeFlipbook() {
    this.isModalOpen.set(false);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.isModalOpen()) {
      this.calculateScale();
    }
  }

  calculateScale() {
    if (isPlatformBrowser(this.platformId)) {
      const padding = 60; // Padding around the flipbook
      const availableWidth = window.innerWidth - padding;
      const availableHeight = window.innerHeight - padding;
      
      const widthScale = availableWidth / 1000;
      const heightScale = availableHeight / 600;
      
      // Calculate scale and cap it at 1 (don't scale up past original size)
      let scale = Math.min(widthScale, heightScale, 1);
      
      // If mobile, we might need a much smaller scale
      if (scale < 0) scale = 0.1;
      
      this.flipbookScale.set(scale);
    }
  }

  initFlipbook() {
    const container = $('#flipbookContainer');
    // Ensure we only init turn.js once
    if (container.length && typeof $.fn.turn === 'function' && !container.hasClass('turn-initialized')) {
      container.addClass('turn-initialized');
      container.turn({
        width: 1000,
        height: 600,
        autoCenter: true,
        display: 'double',
        acceleration: true,
        elevation: 50,
        gradients: true,
      });
    }
  }

  getImageUrl(path: string): string {
    return this.api.getImageUrl(path);
  }
}
