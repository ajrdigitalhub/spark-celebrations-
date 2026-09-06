import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';
import { IconComponent } from '../../shared/components/icon/icon.component';

import { BookingModalComponent } from '../../shared/components/booking-modal/booking-modal';
import { EventBookingModalComponent } from '../../shared/components/event-booking-modal/event-booking-modal';
import { BookingService } from '../../core/services/booking.service';
import { EventBookingService } from '../../core/services/event-booking.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, BookingModalComponent, EventBookingModalComponent, IconComponent],
  template: `
    <app-navbar />
    <main>
      <router-outlet />
    </main>
    <app-footer />
    <app-booking-modal />
    <app-event-booking-modal />

    <!-- Floating Buttons Container -->
    @if (!bookingService.isOpen() && !eventBookingService.isOpen()) {
      <div class="fixed bottom-6 right-6 z-[100] flex flex-col items-center gap-4">
        
        <!-- Instagram Floating Button -->
        @if (instagramUrl()) {
          <a
            [href]="instagramUrl()"
            target="_blank"
            rel="noopener noreferrer"
            class="w-11 h-11 bg-black text-accent rounded-full flex items-center justify-center border border-accent shadow-[0_0_20px_rgba(212,175,55,0.7)] hover:shadow-[0_0_30px_rgba(212,175,55,1)] hover:scale-110 hover:-translate-y-1 transition-all duration-300"
            aria-label="Follow on Instagram"
          >
            <app-icon name="instagram" [size]="22"></app-icon>
          </a>
        }

        <!-- WhatsApp Floating Button -->
        <a
          [href]="'https://wa.me/' + whatsappNumber()"
          target="_blank"
          rel="noopener noreferrer"
          class="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#20ba59] hover:scale-110 hover:-translate-y-1 transition-all duration-300"
          aria-label="Chat on WhatsApp"
        >
          <app-icon name="whatsapp" [size]="32" class="text-white"></app-icon>
        </a>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
    }

    main {
      min-height: 100vh;
    }
  `,
})
export class PublicLayoutComponent implements OnInit {
  bookingService = inject(BookingService);
  eventBookingService = inject(EventBookingService);
  private api = inject(ApiService);
  instagramUrl = signal<string>('');
  whatsappNumber = signal<string>('919990863647');

  ngOnInit(): void {
    this.api.getSettings().subscribe({
      next: (settings) => {
        if (settings?.footer?.socialMedia?.instagram) {
          this.instagramUrl.set(settings.footer.socialMedia.instagram);
        }
        if (settings?.whatsapp?.number) {
          this.whatsappNumber.set(settings.whatsapp.number);
        }
      },
      error: () => {}
    });
  }
}
