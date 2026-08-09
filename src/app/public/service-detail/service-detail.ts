import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { SparkService } from '../../core/models/index';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { switchMap } from 'rxjs';
import { BookingService } from '../../core/services/booking.service';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ImageUrlPipe, IconComponent],
  template: `
    <div class="min-h-screen pt-32 pb-24">
      <div class="section-container">
        
        <!-- Back Button -->
        <a routerLink="/" class="inline-flex items-center gap-2 text-text-secondary hover:text-accent transition-colors mb-8">
          <app-icon name="arrow-left" [size]="20"></app-icon>
          <span class="font-medium">Back to Home</span>
        </a>

        @if (loading()) {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div class="h-[500px] skeleton rounded-2xl"></div>
            <div class="space-y-6">
              <div class="h-12 w-3/4 skeleton rounded-xl"></div>
              <div class="h-6 w-1/4 skeleton rounded-lg"></div>
              <div class="h-32 w-full skeleton rounded-xl"></div>
              <div class="h-16 w-1/2 skeleton rounded-xl"></div>
            </div>
          </div>
        } @else if (service()) {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            <!-- Left Column: Image Gallery -->
            <div class="sticky top-32 space-y-4">
              <!-- Main Image -->
              <div class="relative aspect-[4/3] rounded-2xl overflow-hidden bg-bg-elevated border border-border group shadow-elevated">
                @if (activeImage()) {
                  <img [src]="activeImage() | imageUrl" [alt]="service()?.title" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                } @else {
                  <div class="w-full h-full flex items-center justify-center text-accent/50">
                    <app-icon [name]="service()?.title?.includes('Birthday') ? 'cake' : 'sparkles'" [size]="64"></app-icon>
                  </div>
                }
              </div>

              <!-- Thumbnails -->
              @if (allImages().length > 1) {
                <div class="grid grid-cols-4 sm:grid-cols-5 gap-3 mt-4">
                  @for (img of allImages(); track img; let i = $index) {
                    <div 
                      class="aspect-[4/3] rounded-xl overflow-hidden cursor-pointer border-2 transition-all shadow-card"
                      [class.border-accent]="activeImage() === img"
                      [class.border-transparent]="activeImage() !== img"
                      [class.opacity-50]="activeImage() !== img"
                      [class.hover:opacity-100]="activeImage() !== img"
                      (click)="setActiveImage(img)"
                    >
                      <img [src]="img | imageUrl" class="w-full h-full object-cover">
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Right Column: Details -->
            <div class="space-y-8 animate-fade-in-up">
              <div>
                <div class="inline-block px-4 py-1.5 bg-accent-subtle text-accent rounded-full text-xs font-semibold tracking-wider uppercase mb-5 border border-accent-border">
                  Premium Package
                </div>
                <h1 class="text-4xl md:text-5xl font-heading font-bold mb-4 text-gradient-gold leading-tight drop-shadow-lg">
                  {{ service()?.title }}
                </h1>
                @if (service()?.price) {
                  <p class="text-3xl text-text-primary font-semibold font-heading drop-shadow-md">
                    {{ service()?.price }}
                  </p>
                }
              </div>

              <div class="prose prose-invert max-w-none">
                <p class="text-lg text-text-secondary leading-relaxed">
                  {{ service()?.description || 'Experience an unforgettable celebration in our premium private theatre spaces.' }}
                </p>
              </div>

              @if (service()?.features && service()!.features!.length > 0) {
                <div class="glass p-8 rounded-2xl relative overflow-hidden">
                  <div class="absolute -right-10 -top-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl"></div>
                  
                  <h3 class="text-xl font-heading font-semibold mb-6 flex items-center gap-2 relative z-10">
                    <app-icon name="sparkles" [size]="24" class="text-accent"></app-icon>
                    Package Inclusions
                  </h3>
                  <ul class="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                    @for (feature of service()?.features || []; track feature) {
                      <li class="flex items-start gap-3">
                        <div class="mt-1 w-5 h-5 rounded-full bg-accent-subtle flex items-center justify-center shrink-0 border border-accent-border">
                          <app-icon name="check" [size]="12" class="text-accent"></app-icon>
                        </div>
                        <span class="text-text-primary font-medium">{{ feature }}</span>
                      </li>
                    }
                  </ul>
                </div>
              }

              <!-- Book Now Action -->
              <div class="pt-8 border-t border-border">
                <button class="btn-primary w-full sm:w-auto !py-4 !px-10 !text-lg !rounded-xl inline-block text-center" 
                   (click)="bookingService.open(service() || undefined)">
                  <span>Book This Package</span>
                </button>
                <p class="text-sm text-text-muted mt-4">
                  * Dates are subject to availability. A member of our team will contact you to confirm your booking.
                </p>
              </div>
            </div>

          </div>
        } @else {
          <div class="text-center py-20 animate-fade-in-up">
            <h2 class="text-3xl font-heading text-text-secondary mb-4">Service not found</h2>
            <p class="text-text-muted mb-8">The package you are looking for does not exist or has been removed.</p>
            <a routerLink="/services" class="btn-primary !rounded-xl">View All Services</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class ServiceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);
  public bookingService = inject(BookingService);

  service = signal<SparkService | null>(null);
  loading = signal(true);
  
  allImages = signal<string[]>([]);
  activeImage = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.loading.set(true);
        const id = params.get('id');
        return this.api.getService(id!);
      })
    ).subscribe({
      next: (data) => {
        this.service.set(data);
        this.setupGallery(data);
        this.loading.set(false);
        if (isPlatformBrowser(this.platformId)) {
          window.scrollTo(0, 0); // Scroll to top on load
        }
      },
      error: () => {
        this.service.set(null);
        this.loading.set(false);
      }
    });
  }

  private setupGallery(service: SparkService): void {
    const images: string[] = [];
    if (service.imageUrl) {
      images.push(service.imageUrl);
    }
    if (service.galleryUrls && service.galleryUrls.length > 0) {
      images.push(...service.galleryUrls);
    }
    this.allImages.set(images);
    this.activeImage.set(images.length > 0 ? images[0] : null);
  }

  setActiveImage(img: string): void {
    this.activeImage.set(img);
  }
}
