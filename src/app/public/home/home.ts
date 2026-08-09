import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  PLATFORM_ID,
  ViewChild,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { GsapService } from '../../core/services/gsap.service';
import { SeoService } from '../../core/services/seo.service';
import { SparkService, Testimonial, SiteSettings, GalleryImage, HeroItem } from '../../core/models/index';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading';
import { BookingModalComponent } from '../../shared/components/booking-modal/booking-modal';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { GalleryCoverflowComponent } from '../../shared/components/gallery-coverflow/gallery-coverflow';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';
import { BookingService } from '../../core/services/booking.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, SectionHeadingComponent, IconComponent, GalleryCoverflowComponent, ImageUrlPipe],
  template: `
    <!-- ═══════════ HERO SECTION ═══════════ -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden" id="hero">
      
      <!-- Dynamic Backgrounds -->
      <div class="absolute inset-0 z-0 bg-bg-primary">
        @for (item of activeHeroItems(); track item.id; let i = $index) {
          <div 
            class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            [class.opacity-100]="i === currentHeroIndex()"
            [class.opacity-0]="i !== currentHeroIndex()"
            [class.z-10]="i === currentHeroIndex()"
            [class.z-0]="i !== currentHeroIndex()"
          >
            @if (item.mediaType === 'image') {
              <img [src]="item.mediaUrl | imageUrl" class="w-full h-full object-cover">
            } @else {
              <video [src]="item.mediaUrl | imageUrl" class="w-full h-full object-cover" muted loop playsinline autoplay></video>
            }
            <!-- Dark Overlay for Readability -->
            <div class="absolute inset-0 bg-black/60"></div>
          </div>
        }

        <!-- Fallback Default Background if no items -->
        @if (activeHeroItems().length === 0) {
          <!-- Gradient Orbs -->
          <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px] animate-float"></div>
          <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-[100px] animate-float" style="animation-delay: -3s;"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/3 rounded-full blur-[150px]"></div>
          <!-- Canvas for particles -->
          <canvas #particleCanvas class="absolute inset-0 w-full h-full opacity-40"></canvas>
        }
      </div>

      <!-- Hero Content -->
      <div class="relative z-10 section-container text-center">
        <div class="max-w-4xl mx-auto">
          <!-- Badge -->
          <div class="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-accent-subtle border border-accent-border rounded-full text-accent text-sm font-medium mb-8 opacity-0 backdrop-blur-sm">
            <span class="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            Premium Party Theatre Experience
          </div>

          <!-- Main Heading -->
          <h1 class="hero-title font-heading font-bold leading-[1.05] mb-6 opacity-0 text-white drop-shadow-xl">
            Where Every Moment
            <span class="block text-gradient-gold">Sparkles</span>
          </h1>

          <!-- Dynamic Subtitle / Caption -->
          <div class="hero-subtitle min-h-[80px] opacity-0 flex items-center justify-center">
            @if (activeHeroItems().length > 0) {
              <p class="text-white/90 text-lg md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed drop-shadow-md transition-all duration-500">
                {{ activeHeroItems()[currentHeroIndex()]?.caption || 'Experience an unforgettable celebration in our premium private theatre spaces.' }}
              </p>
            } @else {
              <p class="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Unforgettable birthday parties, dreamy baby showers, and magical celebrations — all in our premium private theatre spaces.
              </p>
            }
          </div>

          <!-- CTAs -->
          <div class="hero-ctas flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 mt-8">
            <button
              class="btn-primary !py-4 !px-8 !text-base !rounded-xl shadow-2xl shadow-accent/20"
              (click)="bookingService.open()"
            >
              <span>Book Your Celebration</span>
            </button>
            <a routerLink="/services" class="btn-ghost !py-4 !px-8 !text-base !rounded-xl !text-white hover:!bg-white/10 backdrop-blur-sm border border-white/20">
              Explore Services →
            </a>
          </div>
          
          <!-- Slide Indicators -->
          @if (activeHeroItems().length > 1) {
            <div class="flex justify-center gap-2 mt-12 hero-ctas opacity-0">
              @for (item of activeHeroItems(); track item.id; let i = $index) {
                <button 
                  (click)="setHeroIndex(i)"
                  class="w-2.5 h-2.5 rounded-full transition-all duration-300"
                  [class.bg-accent]="i === currentHeroIndex()"
                  [class.w-8]="i === currentHeroIndex()"
                  [class.bg-white/50]="i !== currentHeroIndex()"
                  [class.hover:bg-white]="i !== currentHeroIndex()"
                ></button>
              }
            </div>
          }
        </div>
      </div>
    </section>


    <!-- ═══════════ GALLERY COVERFLOW ═══════════ -->
    <section class="py-section relative bg-bg-primary overflow-hidden" id="gallery-carousel">
      <div class="section-container">
        <app-section-heading
          badge="Our Gallery"
          title="Moments We"
          highlight="Created"
          subtitle="A glimpse into the magical celebrations we've hosted"
        />
        
        @if (galleryItems().length > 0) {
          <app-gallery-coverflow 
            [items]="galleryItems()" 
          />
        }
      </div>
    </section>

    <!-- ═══════════ WHY CHOOSE SPARK ═══════════ -->
    <section class="py-section relative" id="why-choose">
      <div class="section-container">
        <app-section-heading
          badge="Why Choose Us"
          title="Why"
          highlight="Spark Celebrations"
          subtitle="We craft extraordinary moments that last a lifetime"
        />

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (item of whyChooseItems; track item.title) {
            <div class="why-card glass glass-hover p-8 text-center group cursor-default">
              <div class="w-16 h-16 mx-auto mb-5 rounded-2xl bg-accent-subtle border border-accent-border flex items-center justify-center group-hover:scale-110 transition-transform duration-500 text-accent">
                <app-icon [name]="item.icon" [size]="32"></app-icon>
              </div>
              <h4 class="text-lg font-heading font-semibold mb-2">{{ item.title }}</h4>
              <p class="text-text-secondary text-sm">{{ item.description }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ═══════════ STATISTICS ═══════════ -->
    <section class="py-section-sm relative" id="stats">
      <div class="section-container">
        <div class="glass p-10 lg:p-14 rounded-2xl">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
            @for (stat of stats; track stat.label) {
              <div class="stat-item text-center">
                <div class="text-4xl lg:text-5xl font-heading font-bold text-gradient-gold mb-2">
                  {{ stat.prefix }}{{ stat.current }}{{ stat.suffix }}
                </div>
                <p class="text-text-secondary text-sm uppercase tracking-wider">{{ stat.label }}</p>
              </div>
            }
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ TESTIMONIALS ═══════════ -->
    <section class="py-section relative" id="testimonials">
      <div class="section-container">
        <app-section-heading
          badge="Testimonials"
          title="What Our Guests"
          highlight="Say"
          subtitle="Real stories from families who celebrated with us"
        />

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          @for (t of testimonialsList(); track t.id) {
            <div class="testimonial-card glass p-8 relative animate-fade-in-up">
              <!-- Quote mark -->
              <div class="text-4xl text-accent/20 font-heading absolute top-4 right-6">"</div>
              <!-- Stars -->
              <div class="flex gap-1 mb-4">
                @for (star of getStars(t.rating); track $index) {
                  <span class="text-accent text-sm">★</span>
                }
              </div>
              <p class="text-text-secondary text-sm leading-relaxed mb-6 line-clamp-4">{{ t.review }}</p>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-accent-subtle border border-accent-border flex items-center justify-center text-accent font-semibold text-sm">
                  {{ t.customerName.charAt(0) }}
                </div>
                <div>
                  <p class="text-text-primary text-sm font-medium">{{ t.customerName }}</p>
                  <p class="text-text-muted text-xs">Verified Guest</p>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ═══════════ INSTAGRAM SECTION ═══════════ -->
    <section class="py-section relative" id="instagram">
      <div class="section-container">
        <app-section-heading
          badge="Instagram"
          title="Follow Our"
          highlight="Journey"
          subtitle="Get inspired by our latest celebrations and behind-the-scenes moments"
        />

        <!-- Elfsight Instagram Feed Widget -->
        <div class="mt-8">
          <div class="elfsight-app-9abb424d-3d13-44f3-8ddc-5163055e777c" data-elfsight-app-lazy></div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .line-clamp-4 {
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .service-card:hover {
      border-color: var(--color-accent-border);
      box-shadow: var(--shadow-glow);
    }
  `,
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  private platformId = inject(PLATFORM_ID);
  private api = inject(ApiService);
  private gsapService = inject(GsapService);
  public bookingService = inject(BookingService);
  private seo = inject(SeoService);

  services = signal<SparkService[]>([]);
  testimonialsList = signal<Testimonial[]>([]);
  galleryItems = signal<GalleryImage[]>([]);
  
  // Hero Carousel
  activeHeroItems = signal<HeroItem[]>([]);
  currentHeroIndex = signal(0);
  private heroInterval: any;



  whyChooseItems = [
    { icon: 'star', title: 'Premium Venues', description: 'Private theatre rooms with state-of-the-art sound and lighting systems.' },
    { icon: 'image', title: 'Custom Themes', description: 'Personalized decorations and themes tailored to your celebration.' },
    { icon: 'users', title: 'Expert Team', description: 'Dedicated event coordinators to make your day flawless.' },
    { icon: 'sparkles', title: 'Magical Moments', description: 'Creating unforgettable memories that last a lifetime.' },
  ];

  stats = [
    { prefix: '', current: 500, suffix: '+', label: 'Events Hosted', target: 500 },
    { prefix: '', current: 10000, suffix: '+', label: 'Happy Guests', target: 10000 },
    { prefix: '', current: 4.9, suffix: '★', label: 'Average Rating', target: 4.9 },
    { prefix: '', current: 3, suffix: '+', label: 'Years of Joy', target: 3 },
  ];

  ngOnInit(): void {
    this.seo.updateMeta({
      title: 'Premium Party Theatre Booking',
      description: 'Book your dream celebration at Spark Celebrations — premium party theatres for birthdays, baby showers, and special events.',
      keywords: 'party theatre, birthday party, baby shower, celebrations, events, Hyderabad',
    });
    this.seo.setOrganizationSchema();

    this.api.getServices().subscribe({
      next: (data) => this.services.set(data),
      error: () => {},
    });

    this.api.getHeroItems().subscribe({
      next: (data) => {
        const active = data.filter(i => i.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
        this.activeHeroItems.set(active);
        this.startHeroCarousel();
      }
    });

    this.api.getTestimonials(true).subscribe({
      next: (data) => this.testimonialsList.set(data),
      error: () => {},
    });

    this.api.getGallery('all').subscribe({
      next: (data) => this.galleryItems.set(data),
      error: () => {},
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    await this.gsapService.init();
    const gsap = this.gsapService.gsap;
    if (!gsap) return;

    // Hero animations with stagger using fromTo and ScrollTrigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    });

    tl.fromTo('.hero-badge', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
      .fromTo('.hero-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
      .fromTo('.hero-ctas', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3');

    // Scroll-triggered reveals
    setTimeout(() => {
      const whyCards = document.querySelectorAll('.why-card');
      if (whyCards.length) {
        this.gsapService.staggerReveal(Array.from(whyCards) as HTMLElement[], { stagger: 0.1 });
      }

      const statItems = document.querySelectorAll('.stat-item');
      if (statItems.length) {
        this.gsapService.staggerReveal(Array.from(statItems) as HTMLElement[]);
      }

      const igCards = document.querySelectorAll('.ig-card');
      if (igCards.length) {
        this.gsapService.staggerReveal(Array.from(igCards) as HTMLElement[], { stagger: 0.08 });
      }
    }, 500);

    // Initialize particle canvas
    this.initParticles();
  }

  ngOnDestroy(): void {
    this.gsapService.killAll();
    if (this.heroInterval) {
      clearInterval(this.heroInterval);
    }
  }

  startHeroCarousel(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.activeHeroItems().length <= 1) return;
    
    this.heroInterval = setInterval(() => {
      const nextIndex = (this.currentHeroIndex() + 1) % this.activeHeroItems().length;
      this.currentHeroIndex.set(nextIndex);
    }, 6000);
  }

  setHeroIndex(index: number): void {
    this.currentHeroIndex.set(index);
    // Reset timer
    if (this.heroInterval) {
      clearInterval(this.heroInterval);
    }
    this.startHeroCarousel();
  }


  getStars(rating: number): number[] {
    return Array.from({ length: rating }, (_, i) => i);
  }

  private initParticles(): void {
    const canvas = document.querySelector('#hero canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      opacityDir: number;
    }

    const particles: Particle[] = [];
    const count = Math.min(60, Math.floor(window.innerWidth / 25));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1,
        opacityDir: Math.random() > 0.5 ? 0.002 : -0.002,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += p.opacityDir;

        if (p.opacity > 0.6 || p.opacity < 0.1) p.opacityDir *= -1;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 168, 83, ${p.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }
}
