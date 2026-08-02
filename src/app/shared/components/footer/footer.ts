import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { SiteSettings } from '../../../core/models/index';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <footer class="relative bg-bg-surface border-t border-border">
      <!-- Gradient separator -->
      <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>

      <div class="section-container py-16 lg:py-20">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <!-- Brand Column -->
          <div class="lg:col-span-1">
            <div class="flex items-center mb-5">
              <img src="/images/logo.png" alt="Spark Celebrations Logo" class="h-16 w-auto object-contain" style="max-height: 80px; width: auto;" />
            </div>
            <p class="text-text-secondary text-sm leading-relaxed mb-6">
              Where every moment sparkles. Premium party theatre experiences for your most cherished celebrations.
            </p>
            <!-- Social Icons -->
            <div class="flex gap-3">
              @for (social of socials; track social.name) {
                <a
                  [href]="social.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-10 h-10 rounded-lg bg-bg-elevated border border-border flex items-center justify-center text-text-muted hover:text-accent hover:border-accent-border transition-all duration-300 hover:-translate-y-1"
                  [attr.aria-label]="social.name"
                >
                  <app-icon [name]="social.icon" [size]="18"></app-icon>
                </a>
              }
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="text-sm font-semibold uppercase tracking-wider text-text-primary mb-5">Quick Links</h4>
            <ul class="space-y-3">
              @for (link of quickLinks; track link.url) {
                <li>
                  <a
                    [routerLink]="link.url"
                    class="text-text-secondary text-sm hover:text-accent transition-colors duration-300 inline-flex items-center gap-2"
                  >
                    <span class="w-1 h-1 rounded-full bg-accent/40"></span>
                    {{ link.label }}
                  </a>
                </li>
              }
            </ul>
          </div>

          <!-- Contact Info -->
          <div>
            <h4 class="text-sm font-semibold uppercase tracking-wider text-text-primary mb-5">Get In Touch</h4>
            <ul class="space-y-4">
              <li class="flex items-start gap-3">
                <app-icon name="map-pin" [size]="20" class="text-accent mt-0.5"></app-icon>
                <span class="text-text-secondary text-sm">{{ address() }}</span>
              </li>
              <li class="flex items-center gap-3">
                <app-icon name="phone" [size]="20" class="text-accent"></app-icon>
                <a [href]="'tel:' + phone()" class="text-text-secondary text-sm hover:text-accent transition-colors">
                  {{ phone() }}
                </a>
              </li>
              <li class="flex items-center gap-3">
                <app-icon name="mail" [size]="20" class="text-accent"></app-icon>
                <a [href]="'mailto:' + email()" class="text-text-secondary text-sm hover:text-accent transition-colors">
                  {{ email() }}
                </a>
              </li>
            </ul>
          </div>

          <!-- Business Hours -->
          <div>
            <h4 class="text-sm font-semibold uppercase tracking-wider text-text-primary mb-5">Business Hours</h4>
            <ul class="space-y-3">
              <li class="flex justify-between text-sm">
                <span class="text-text-secondary">Mon – Fri</span>
                <span class="text-text-primary">10 AM – 9 PM</span>
              </li>
              <li class="flex justify-between text-sm">
                <span class="text-text-secondary">Saturday</span>
                <span class="text-text-primary">10 AM – 10 PM</span>
              </li>
              <li class="flex justify-between text-sm">
                <span class="text-text-secondary">Sunday</span>
                <span class="text-text-primary">11 AM – 9 PM</span>
              </li>
            </ul>

          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6 relative">
          <!-- Left: Copyright -->
          <div class="w-full md:flex-1 md:text-left text-center">
            <p class="text-text-muted text-xs">{{ copyright() }}</p>
          </div>
          
          <!-- Center: Watermark -->
          <div class="w-full md:flex-1 text-center">
            <p class="text-text-muted text-xs">
              Developed by 
              <a href="https://ajrdigitalhub.in/" target="_blank" rel="noopener noreferrer" class="text-text-primary hover:text-accent font-semibold tracking-wider text-sm transition-colors duration-300">
                AJR DIGITAL HUB
              </a>
            </p>
          </div>

          <!-- Right: Policies -->
          <div class="w-full md:flex-1 flex items-center justify-center md:justify-end gap-6">
            @for (policy of policies; track policy.url) {
              <a
                [routerLink]="policy.url"
                class="text-text-muted text-xs hover:text-accent transition-colors duration-300"
              >
                {{ policy.label }}
              </a>
            }
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent implements OnInit {
  private api = inject(ApiService);

  phone = signal('+91 9990863647');
  email = signal('hello@sparkcelebrations.com');
  address = signal('Hyderabad, Telangana, India');
  copyright = signal('© 2026 Spark Celebrations. All rights reserved.');
  whatsappNumber = signal('919990863647');

  quickLinks = [
    { label: 'Home', url: '/' },
    { label: 'Services', url: '/services' },
    { label: 'Gallery', url: '/gallery' },
    { label: 'About Us', url: '/about' },
    { label: 'Flipbook', url: '/flipbook' },
    { label: 'Contact', url: '/contact' },
  ];

  policies = [
    { label: 'Privacy Policy', url: '/privacy' },
    { label: 'Terms of Service', url: '/terms' },
  ];

  socials = [
    { name: 'Instagram', icon: 'instagram', url: 'https://instagram.com/sparkcelebrations' },
    { name: 'Facebook', icon: 'facebook', url: 'https://facebook.com/sparkcelebrations' },
    { name: 'YouTube', icon: 'youtube', url: '#' },
  ];

  ngOnInit(): void {
    this.api.getSettings().subscribe({
      next: (settings: SiteSettings) => {
        if (settings.contact) {
          this.phone.set(settings.contact.phone);
          this.email.set(settings.contact.email);
          this.address.set(settings.contact.address);
        }
        if (settings.whatsapp) {
          this.whatsappNumber.set(settings.whatsapp.number);
        }
        if (settings.footer) {
          this.copyright.set(settings.footer.copyright);
        }
      },
      error: () => {
        // Use defaults if API not available
      },
    });
  }
}
