import { Component, inject, signal, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { SparkService, SiteSettings } from '../../../core/models/index';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
        (click)="close()"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

        <!-- Modal -->
        <div
          class="relative w-full sm:max-w-lg bg-bg-surface border border-border rounded-t-3xl sm:rounded-2xl p-8 animate-fade-in-up max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()"
        >
          <!-- Close button -->
          <button
            class="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
            (click)="close()"
          >
            ✕
          </button>

          <!-- Header -->
          <h3 class="text-2xl font-heading font-semibold mb-1">Book Your Celebration</h3>
          <p class="text-text-secondary text-sm mb-6">Fill in the details and we'll connect with you on WhatsApp</p>

          <!-- Service Badge -->
          @if (selectedService()) {
            <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-subtle border border-accent-border rounded-full text-accent text-sm font-medium mb-6">
              {{ selectedService()!.title }}
            </div>
          }

          <!-- Form -->
          <form (ngSubmit)="submitBooking()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1.5">Your Name *</label>
              <input
                type="text"
                [(ngModel)]="form.customerName"
                name="customerName"
                required
                class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-border focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1.5">Mobile Number *</label>
              <input
                type="tel"
                [(ngModel)]="form.mobile"
                name="mobile"
                required
                class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-border focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
                placeholder="9876543210"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1.5">Event Date *</label>
              <input
                type="date"
                [(ngModel)]="form.eventDate"
                name="eventDate"
                required
                class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1.5">Preferred Time</label>
              <select
                [(ngModel)]="form.preferredTime"
                name="preferredTime"
                class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
              >
                <option value="">Select time slot</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="06:00 PM">06:00 PM</option>
                <option value="08:00 PM">08:00 PM</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1.5">Special Notes</label>
              <textarea
                [(ngModel)]="form.notes"
                name="notes"
                rows="3"
                class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-border focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all resize-none"
                placeholder="Any special requirements..."
              ></textarea>
            </div>

            <button
              type="submit"
              class="w-full btn-primary !py-3.5 !text-base !rounded-xl mt-2 flex items-center justify-center gap-2"
              [disabled]="submitting()"
            >
              <app-icon name="whatsapp" [size]="20"></app-icon>
              <span>{{ submitting() ? 'Submitting...' : 'Book via WhatsApp' }}</span>
            </button>
          </form>
        </div>
      </div>
    }
  `,
})
export class BookingModalComponent implements OnInit {
  @Output() closed = new EventEmitter<void>();

  private api = inject(ApiService);

  isOpen = signal(false);
  submitting = signal(false);
  selectedService = signal<SparkService | null>(null);
  whatsappNumber = signal('919990863647');
  messageTemplate = signal('');

  form = {
    customerName: '',
    mobile: '',
    eventDate: '',
    preferredTime: '',
    notes: '',
  };

  ngOnInit(): void {
    this.api.getSettings().subscribe({
      next: (settings: SiteSettings) => {
        if (settings.whatsapp) {
          this.whatsappNumber.set(settings.whatsapp.number);
          this.messageTemplate.set(settings.whatsapp.messageTemplate);
        }
      },
      error: () => {},
    });
  }

  open(service?: SparkService): void {
    this.selectedService.set(service ?? null);
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    this.isOpen.set(false);
    document.body.style.overflow = '';
    this.resetForm();
    this.closed.emit();
  }

  async submitBooking(): Promise<void> {
    if (!this.form.customerName || !this.form.mobile || !this.form.eventDate) return;

    this.submitting.set(true);

    const serviceName = this.selectedService()?.title || 'General Inquiry';

    // Save booking to database
    this.api.submitBooking({
      customerName: this.form.customerName,
      mobile: this.form.mobile,
      serviceName,
      eventDate: this.form.eventDate,
      preferredTime: this.form.preferredTime || null,
      notes: this.form.notes || null,
    }).subscribe({
      next: () => {
        // Redirect to WhatsApp
        this.redirectToWhatsApp(serviceName);
        this.submitting.set(false);
        this.close();
      },
      error: () => {
        // Even if DB save fails, still redirect to WhatsApp
        this.redirectToWhatsApp(serviceName);
        this.submitting.set(false);
        this.close();
      },
    });
  }

  private redirectToWhatsApp(serviceName: string): void {
    let message = this.messageTemplate() || this.getDefaultMessage(serviceName);

    // Replace template variables
    message = message
      .replace('{serviceName}', serviceName)
      .replace('{customerName}', this.form.customerName)
      .replace('{mobile}', this.form.mobile)
      .replace('{eventDate}', this.form.eventDate)
      .replace('{preferredTime}', this.form.preferredTime || 'Not specified')
      .replace('{notes}', this.form.notes || 'None');

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${this.whatsappNumber()}?text=${encoded}`;
    window.open(url, '_blank');
  }

  private getDefaultMessage(serviceName: string): string {
    return `Hello Spark Celebrations,\nI would like to book:\n*${serviceName}*\n\nCustomer Name: ${this.form.customerName}\nMobile: ${this.form.mobile}\nDate: ${this.form.eventDate}\nTime: ${this.form.preferredTime || 'Not specified'}\nNotes: ${this.form.notes || 'None'}`;
  }

  private resetForm(): void {
    this.form = {
      customerName: '',
      mobile: '',
      eventDate: '',
      preferredTime: '',
      notes: '',
    };
  }
}
