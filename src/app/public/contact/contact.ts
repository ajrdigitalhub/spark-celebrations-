import { Component, OnInit, inject, signal, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { GsapService } from '../../core/services/gsap.service';
import { SiteSettings } from '../../core/models/index';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, SectionHeadingComponent, IconComponent],
  template: `
    <section class="pt-32 pb-section relative">
      <div class="absolute inset-0">
        <div class="absolute top-40 right-20 w-80 h-80 bg-accent/5 rounded-full blur-[100px]"></div>
      </div>
      <div class="section-container relative z-10">
        <app-section-heading
          badge="Contact"
          title="Get In"
          highlight="Touch"
          subtitle="Ready to book your celebration? We'd love to hear from you."
        />

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Contact Form -->
          <div class="contact-block glass p-8 lg:p-10 rounded-2xl">
            <h3 class="text-xl font-heading font-semibold mb-6">Send us a Message</h3>
            <form (ngSubmit)="submitForm()" class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
                <input
                  type="text"
                  [(ngModel)]="contactForm.name"
                  name="name"
                  required
                  class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-border focus:outline-none transition-all"
                  placeholder="Your name"
                />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
                  <input
                    type="email"
                    [(ngModel)]="contactForm.email"
                    name="email"
                    class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-border focus:outline-none transition-all"
                    placeholder="you@email.com"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-text-secondary mb-1.5">Phone</label>
                  <input
                    type="tel"
                    [(ngModel)]="contactForm.phone"
                    name="phone"
                    class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-border focus:outline-none transition-all"
                    placeholder="9876543210"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-text-secondary mb-1.5">Message</label>
                <textarea
                  [(ngModel)]="contactForm.message"
                  name="message"
                  rows="4"
                  class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-border focus:outline-none transition-all resize-none"
                  placeholder="Tell us about your celebration..."
                ></textarea>
              </div>
              <button type="submit" class="btn-primary w-full !rounded-xl !py-3.5">
                <span>Send Message</span>
              </button>
            </form>
          </div>

          <!-- Contact Info -->
          <div class="space-y-6">
            <!-- Contact Cards -->
            <div class="contact-block glass p-6 rounded-2xl flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-accent-subtle border border-accent-border flex items-center justify-center text-accent flex-shrink-0">
                <app-icon name="phone" [size]="24"></app-icon>
              </div>
              <div>
                <h4 class="text-sm font-semibold text-text-primary">Phone</h4>
                <a [href]="'tel:' + phone()" class="text-text-secondary text-sm hover:text-accent transition-colors">
                  {{ phone() }}
                </a>
              </div>
            </div>

            <div class="contact-block glass p-6 rounded-2xl flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-accent-subtle border border-accent-border flex items-center justify-center text-accent flex-shrink-0">
                <app-icon name="mail" [size]="24"></app-icon>
              </div>
              <div>
                <h4 class="text-sm font-semibold text-text-primary">Email</h4>
                <a [href]="'mailto:' + email()" class="text-text-secondary text-sm hover:text-accent transition-colors">
                  {{ email() }}
                </a>
              </div>
            </div>

            <div class="contact-block glass p-6 rounded-2xl flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-accent-subtle border border-accent-border flex items-center justify-center text-accent flex-shrink-0">
                <app-icon name="map-pin" [size]="24"></app-icon>
              </div>
              <div>
                <h4 class="text-sm font-semibold text-text-primary">Address</h4>
                <p class="text-text-secondary text-sm">{{ address() }}</p>
              </div>
            </div>

            <!-- WhatsApp CTA -->
            <a
              [href]="'https://wa.me/' + whatsapp()"
              target="_blank"
              rel="noopener noreferrer"
              class="contact-block flex items-center gap-4 p-6 bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl hover:bg-[#25D366]/15 transition-all duration-300 group"
            >
              <div class="w-12 h-12 rounded-xl bg-[#25D366]/20 flex items-center justify-center text-[#25D366] flex-shrink-0">
                <app-icon name="whatsapp" [size]="24"></app-icon>
              </div>
              <div>
                <h4 class="text-sm font-semibold text-[#25D366]">WhatsApp</h4>
                <p class="text-text-secondary text-sm">Chat with us instantly</p>
              </div>
              <span class="ml-auto text-[#25D366] group-hover:translate-x-1 transition-transform">→</span>
            </a>

            <!-- Map -->
            <div class="contact-block rounded-2xl overflow-hidden border border-border h-64">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3824.487575578237!2d81.52911577388531!3d16.551947626336993!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a37cdd8b8089707%3A0xc0b8a09b2e3928f!2sSPARK%20Celebrations!5e0!3m2!1sen!2sin!4v1785527724790!5m2!1sen!2sin" class="w-full h-full" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>
            </div>

            <!-- Business Hours -->
            <div class="contact-block glass p-6 rounded-2xl">
              <h4 class="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                <app-icon name="calendar" [size]="16" class="text-accent"></app-icon> Business Hours
              </h4>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-text-secondary">Mon – Fri</span>
                  <span class="text-text-primary">10:00 AM – 9:00 PM</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-text-secondary">Saturday</span>
                  <span class="text-text-primary">10:00 AM – 10:00 PM</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-text-secondary">Sunday</span>
                  <span class="text-text-primary">11:00 AM – 9:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ContactComponent implements OnInit, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private api = inject(ApiService);
  private seo = inject(SeoService);
  private gsapService = inject(GsapService);

  phone = signal('+91 9990863647');
  email = signal('hello@sparkcelebrations.com');
  address = signal('Hyderabad, Telangana, India');
  whatsapp = signal('919990863647');

  contactForm = { name: '', email: '', phone: '', message: '' };

  ngOnInit(): void {
    this.seo.updateMeta({
      title: 'Contact Us',
      description: 'Get in touch with Spark Celebrations — book your premium party theatre experience today.',
    });

    this.api.getSettings().subscribe({
      next: (settings: SiteSettings) => {
        if (settings.contact) {
          this.phone.set(settings.contact.phone);
          this.email.set(settings.contact.email);
          this.address.set(settings.contact.address);
        }
        if (settings.whatsapp) {
          this.whatsapp.set(settings.whatsapp.number);
        }
      },
      error: () => {},
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    await this.gsapService.init();
    setTimeout(() => {
      const blocks = document.querySelectorAll('.contact-block');
      if (blocks.length) {
        this.gsapService.staggerReveal(Array.from(blocks) as HTMLElement[], { stagger: 0.1 });
      }
    }, 300);
  }

  submitForm(): void {
    // For now, redirect to WhatsApp with form data
    const msg = `Hello Spark Celebrations,\n\nName: ${this.contactForm.name}\nEmail: ${this.contactForm.email}\nPhone: ${this.contactForm.phone}\nMessage: ${this.contactForm.message}`;
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${this.whatsapp()}?text=${encoded}`, '_blank');
  }
}
