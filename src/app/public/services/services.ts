import { Component, OnInit, inject, signal, ViewChild, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { GsapService } from '../../core/services/gsap.service';
import { SparkService } from '../../core/models/index';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading';
import { BookingModalComponent } from '../../shared/components/booking-modal/booking-modal';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink, SectionHeadingComponent, BookingModalComponent, IconComponent, ImageUrlPipe],
  template: `
    <!-- Hero Banner -->
    <section class="pt-32 pb-16 relative">
      <div class="absolute inset-0">
        <div class="absolute top-20 right-20 w-80 h-80 bg-accent/5 rounded-full blur-[100px]"></div>
      </div>
      <div class="section-container relative z-10">
        <app-section-heading
          badge="Our Services"
          title="Premium Celebration"
          highlight="Packages"
          subtitle="Every event is unique. Choose the perfect package and let us create something extraordinary for you."
        />
      </div>
    </section>

    <!-- Services Grid -->
    <section class="pb-section relative">
      <div class="section-container">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          @for (service of services(); track service.id) {
            <a [routerLink]="['/services', service.id]" class="service-card card p-0 group block cursor-pointer">
              <!-- Image Area -->
              <div class="h-48 bg-bg-elevated relative overflow-hidden flex items-center justify-center">
                @if (service.imageUrl && service.imageUrl.trim().length > 0) {
                  <img [src]="service.imageUrl | imageUrl" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out absolute inset-0">
                } @else {
                  <app-icon [name]="service.title?.toLowerCase()?.includes('birthday') ? 'cake' : 'baby'" [size]="48" class="text-accent/50"></app-icon>
                }
                @if (service.price) {
                  <div class="absolute top-3 right-3 z-20 px-3 py-1 bg-accent/90 backdrop-blur-sm shadow-lg rounded-full text-white font-semibold text-xs">
                    {{ service.price }}
                  </div>
                }
              </div>

              <!-- Content -->
              <div class="p-5">
                <h3 class="text-lg font-heading font-semibold mb-2 group-hover:text-accent transition-colors line-clamp-1">
                  {{ service.title }}
                </h3>
                <p class="text-text-secondary text-xs leading-relaxed mb-4 line-clamp-2">
                  {{ service.description }}
                </p>

                <!-- Features -->
                @if (service.features && service.features.length > 0) {
                  <div class="mb-4">
                    <div class="grid grid-cols-2 gap-1.5">
                      @for (feature of (service.features.slice(0,4)); track feature) {
                        <div class="flex items-center gap-1.5 text-[11px] text-text-secondary line-clamp-1">
                          <span class="w-1 h-1 rounded-full bg-accent flex-shrink-0"></span>
                          {{ feature }}
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- Book Button -->
                @if (service.bookingEnabled) {
                  <a
                    class="btn-primary w-full !rounded-xl !py-2 !text-sm block text-center mt-2"
                    [routerLink]="['/book']"
                    [queryParams]="{serviceId: service.id}"
                    (click)="$event.stopPropagation()"
                  >
                    <span>Quick Book</span>
                  </a>
                }
              </div>
            </a>
          }
        </div>

        @if (services().length === 0) {
          <div class="text-center py-20">
            <div class="flex justify-center mb-4 text-accent"><app-icon name="party" [size]="48"></app-icon></div>
            <h3 class="text-xl font-heading font-semibold mb-2">Services Coming Soon</h3>
            <p class="text-text-secondary">We're preparing something special for you.</p>
          </div>
        }
      </div>
    </section>

    <app-booking-modal #bookingModal />
  `,
  styles: `
    .service-card:hover {
      border-color: var(--color-accent-border);
      box-shadow: var(--shadow-glow);
    }
  `,
})
export class ServicesComponent implements OnInit, AfterViewInit {
  @ViewChild('bookingModal') bookingModal!: BookingModalComponent;

  private platformId = inject(PLATFORM_ID);
  private api = inject(ApiService);
  private seo = inject(SeoService);
  private gsapService = inject(GsapService);

  services = signal<SparkService[]>([]);

  ngOnInit(): void {
    this.seo.updateMeta({
      title: 'Our Services',
      description: 'Explore premium celebration packages — birthday parties, baby showers, and more at Spark Celebrations.',
    });

    this.api.getServices().subscribe({
      next: (data) => this.services.set(data),
      error: () => {},
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    await this.gsapService.init();
    setTimeout(() => {
      const cards = document.querySelectorAll('.service-card');
      if (cards.length) {
        this.gsapService.staggerReveal(Array.from(cards) as HTMLElement[], { stagger: 0.2 });
      }
    }, 300);
  }

  openBooking(service: SparkService): void {
    this.bookingModal.open(service);
  }
}
