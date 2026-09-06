import { Component, OnInit, inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';
import { GsapService } from '../../core/services/gsap.service';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, SectionHeadingComponent, IconComponent],
  template: `
    <!-- Hero -->
    <section class="pt-32 pb-16 relative">
      <div class="absolute inset-0">
        <div class="absolute top-20 left-1/3 w-96 h-96 bg-accent/5 rounded-full blur-[120px]"></div>
      </div>
      <div class="section-container relative z-10">
        <app-section-heading
          badge="Our Story"
          title="About"
          highlight="Spark Celebrations"
          subtitle="From a simple dream to Bhimavaram's premier party theatre experience"
        />
      </div>
    </section>

    <!-- Story -->
    <section class="pb-section">
      <div class="section-container">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div class="about-block">
            <h3 class="text-2xl font-heading font-semibold mb-4">Our Journey</h3>
            <p class="text-text-secondary leading-relaxed mb-4">
              Spark Celebrations was born from a simple belief: everyone deserves a celebration that feels truly special. We noticed a gap in the market — families wanted more than just a venue. They wanted an experience.
            </p>
            <p class="text-text-secondary leading-relaxed">
              That's why we created premium private theatre rooms designed specifically for celebrations. Each space is crafted with attention to detail — from the sound system to the decorations — ensuring every moment is magical.
            </p>
          </div>
          <div class="about-block glass p-10 rounded-2xl text-center">
            <div class="flex justify-center mb-6 text-accent"><app-icon name="party" [size]="80"></app-icon></div>
            <h3 class="text-xl font-heading font-semibold mb-2">Premium Theatre Spaces</h3>
            <p class="text-text-secondary text-sm">Designed for unforgettable celebrations</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission & Vision -->
    <section class="pb-section">
      <div class="section-container">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="mv-card glass p-10 rounded-2xl">
            <div class="w-14 h-14 rounded-xl bg-accent-subtle border border-accent-border flex items-center justify-center text-accent mb-5">
              <app-icon name="target" [size]="28"></app-icon>
            </div>
            <h3 class="text-xl font-heading font-semibold mb-3">Our Mission</h3>
            <p class="text-text-secondary leading-relaxed">
              To create extraordinary celebration experiences that bring families closer together. We believe every birthday, baby shower, and milestone deserves a premium, hassle-free experience.
            </p>
          </div>
          <div class="mv-card glass p-10 rounded-2xl">
            <div class="w-14 h-14 rounded-xl bg-accent-subtle border border-accent-border flex items-center justify-center text-accent mb-5">
              <app-icon name="star" [size]="28"></app-icon>
            </div>
            <h3 class="text-xl font-heading font-semibold mb-3">Our Vision</h3>
            <p class="text-text-secondary leading-relaxed">
              To become India's most loved celebration brand — known for exceptional service, premium spaces, and creating moments that families treasure forever.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <section class="pb-section">
      <div class="section-container">
        <app-section-heading
          badge="Timeline"
          title="Our"
          highlight="Journey"
        />

        <div class="max-w-2xl mx-auto">
          @for (item of timeline; track item.year) {
            <div class="timeline-item flex gap-6 mb-10 last:mb-0">
              <div class="flex flex-col items-center">
                <div class="w-12 h-12 rounded-full bg-accent-subtle border-2 border-accent flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
                  {{ item.year }}
                </div>
                @if (!$last) {
                  <div class="w-px h-full bg-border mt-2"></div>
                }
              </div>
              <div class="pb-8">
                <h4 class="text-lg font-heading font-semibold mb-1">{{ item.title }}</h4>
                <p class="text-text-secondary text-sm">{{ item.description }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="pb-section">
      <div class="section-container">
        <div class="glass p-10 lg:p-14 rounded-2xl">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
            @for (stat of stats; track stat.label) {
              <div class="stat-item text-center">
                <div class="text-4xl lg:text-5xl font-heading font-bold text-gradient-gold mb-2">
                  {{ stat.value }}
                </div>
                <p class="text-text-secondary text-sm uppercase tracking-wider">{{ stat.label }}</p>
              </div>
            }
          </div>
        </div>
      </div>
    </section>

    <!-- Founder -->
    <section class="pb-section">
      <div class="section-container">
        <div class="glass p-10 lg:p-14 rounded-2xl text-center max-w-2xl mx-auto">
          <div class="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-accent to-accent-dim flex items-center justify-center text-4xl text-bg-primary font-heading font-bold mb-6">
            SC
          </div>
          <h3 class="text-xl font-heading font-semibold mb-2">The Spark Team</h3>
          <p class="text-text-muted text-sm mb-4">Founders & Creative Directors</p>
          <p class="text-text-secondary leading-relaxed">
            "We started Spark Celebrations with one goal — to make every celebration feel like a movie premiere. Our team pours heart and soul into every event, ensuring your special day is nothing short of spectacular."
          </p>
        </div>
      </div>
    </section>
  `,
})
export class AboutComponent implements OnInit, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private seo = inject(SeoService);
  private gsapService = inject(GsapService);

  timeline = [
    { year: '23', title: 'The Spark Begins', description: 'Founded with a vision to transform celebrations in Bhimavaram.' },
    { year: '24', title: 'First Theatre Launch', description: 'Opened our first premium private theatre room for celebrations.' },
    { year: '25', title: '500+ Events', description: 'Crossed 500 successful celebrations with 5-star reviews.' },
    { year: '26', title: 'Expanding Horizons', description: 'Growing our spaces and services to create even more magical moments.' },
  ];

  stats = [
    { value: '600+', label: 'Events Hosted' },
    { value: '5000+', label: 'Happy Guests' },
    { value: '4.9★', label: 'Rating' },
    { value: '1 year+', label: 'Experience' },
  ];

  ngOnInit(): void {
    this.seo.updateMeta({
      title: 'About Us',
      description: 'Learn about Spark Celebrations — our journey, mission, vision, and the team behind Bhimavaram\'s premium party theatre experience.',
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    await this.gsapService.init();

    setTimeout(() => {
      const blocks = document.querySelectorAll('.about-block, .mv-card, .timeline-item, .stat-item');
      if (blocks.length) {
        this.gsapService.staggerReveal(Array.from(blocks) as HTMLElement[], { stagger: 0.12 });
      }
    }, 300);
  }
}
