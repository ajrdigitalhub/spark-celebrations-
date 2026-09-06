import { Component, OnInit, inject, signal, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { GsapService } from '../../core/services/gsap.service';
import { GalleryImage } from '../../core/models/index';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, SectionHeadingComponent, IconComponent, ImageUrlPipe],
  template: `
    <section class="pt-32 pb-section relative">
      <div class="absolute inset-0">
        <div class="absolute top-40 left-20 w-80 h-80 bg-accent/5 rounded-full blur-[100px]"></div>
      </div>
      <div class="section-container relative z-10">
        <app-section-heading
          badge="Gallery"
          title="Moments We've"
          highlight="Captured"
          subtitle="A glimpse into the magical celebrations we've created"
        />

        <!-- Category Filter -->
        <div class="flex items-center justify-center gap-3 mb-12 flex-wrap">
          @for (cat of categories; track cat) {
            <button
              class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
              [class]="activeCategory() === cat
                ? 'bg-accent text-bg-primary'
                : 'bg-bg-elevated border border-border text-text-secondary hover:border-accent-border hover:text-accent'"
              (click)="filterCategory(cat)"
            >
              {{ cat === 'all' ? 'All' : cat | titlecase }}
            </button>
          }
        </div>

        <!-- Grid Gallery -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (image of filteredImages(); track image.id) {
            <div
              class="gallery-item rounded-xl overflow-hidden bg-bg-elevated border border-border group cursor-pointer relative"
              (click)="openLightbox(image)"
            >
              <div class="aspect-[3/4] bg-bg-elevated relative">
                @if (image.imageUrl) {
                  <img [src]="image.imageUrl | imageUrl" alt="" class="w-full h-full object-cover">
                } @else {
                  <div class="w-full h-full flex items-center justify-center text-accent">
                    <app-icon [name]="getEmoji(image.category)" [size]="48"></app-icon>
                  </div>
                }
              </div>
              <!-- Hover Overlay -->
              <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div class="text-center text-white">
                  <div class="flex justify-center"><app-icon name="search" [size]="32"></app-icon></div>
                </div>
              </div>
            </div>
          }
        </div>

        @if (filteredImages().length === 0 && !loading()) {
          <div class="text-center py-20 text-text-muted">
            <div class="flex justify-center mb-4"><app-icon name="camera" [size]="64"></app-icon></div>
            <h3 class="text-xl font-heading font-semibold mb-2 text-text-primary">Gallery Coming Soon</h3>
            <p class="text-text-secondary">Beautiful moments will be shared here.</p>
          </div>
        }

        @if (loading()) {
          <div class="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            @for (i of [1,2,3,4,5,6,7,8]; track i) {
              <div class="break-inside-avoid rounded-xl overflow-hidden">
                <div class="skeleton" [style.height.px]="200 + (i % 3) * 80"></div>
              </div>
            }
          </div>
        }
      </div>
    </section>

    <!-- Lightbox -->
    @if (lightboxImage()) {
      <div
        class="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
        (click)="closeLightbox()"
      >
        <button class="absolute top-6 right-6 text-white text-2xl hover:text-accent transition-colors z-10">✕</button>
        <div class="max-w-4xl max-h-[90vh] flex items-center justify-center p-4" (click)="$event.stopPropagation()">
          <div class="bg-bg-elevated rounded-2xl overflow-hidden relative">
            @if (lightboxImage()!.imageUrl) {
              <img [src]="lightboxImage()!.imageUrl | imageUrl" alt="" class="max-w-full max-h-[85vh] object-contain">
            } @else {
              <div class="p-20 text-accent flex items-center justify-center">
                <app-icon [name]="getEmoji(lightboxImage()!.category)" [size]="96"></app-icon>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class GalleryComponent implements OnInit, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private api = inject(ApiService);
  private seo = inject(SeoService);
  private gsapService = inject(GsapService);

  images = signal<GalleryImage[]>([]);
  filteredImages = signal<GalleryImage[]>([]);
  activeCategory = signal('all');
  loading = signal(true);
  lightboxImage = signal<GalleryImage | null>(null);

  categories = ['all', 'birthday', 'baby shower', 'anniversary', 'general'];

  ngOnInit(): void {
    this.seo.updateMeta({
      title: 'Gallery',
      description: 'Browse our gallery of premium celebrations — birthdays, baby showers, and events at Spark Celebrations.',
    });

    this.api.getGallery().subscribe({
      next: (data) => {
        this.images.set(data);
        this.filteredImages.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    await this.gsapService.init();
    setTimeout(() => {
      const items = document.querySelectorAll('.gallery-item');
      if (items.length) {
        this.gsapService.staggerReveal(Array.from(items) as HTMLElement[], { stagger: 0.08 });
      }
    }, 500);
  }

  filterCategory(category: string): void {
    this.activeCategory.set(category);
    if (category === 'all') {
      this.filteredImages.set(this.images());
    } else {
      this.filteredImages.set(this.images().filter((img) => img.category === category));
    }
  }

  openLightbox(image: GalleryImage): void {
    this.lightboxImage.set(image);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightboxImage.set(null);
    document.body.style.overflow = '';
  }

  getEmoji(category: string): string {
    const map: Record<string, string> = {
      birthday: 'cake',
      'baby shower': 'baby',
      anniversary: 'heart',
      general: 'party',
    };
    return map[category] || 'image';
  }
}
