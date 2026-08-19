import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { BookingService } from '../../../core/services/booking.service';
import { SparkService, SiteSettings, Addon } from '../../../core/models/index';
import { IconComponent } from '../icon/icon.component';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ImageUrlPipe],
  template: `
    @if (bookingService.isOpen()) {
      <div
        class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
        (click)="close()"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

        <!-- Modal -->
        <div
          class="relative w-full sm:max-w-2xl bg-bg-surface border border-border rounded-t-3xl sm:rounded-2xl p-6 sm:p-8 animate-fade-in-up max-h-[90vh] flex flex-col"
          (click)="$event.stopPropagation()"
        >
          <!-- Close button -->
          <button
            class="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-text-muted hover:text-text-primary transition-colors z-10"
            (click)="close()"
          >
            ✕
          </button>

          <!-- Header & Stepper -->
          <div class="shrink-0 mb-6">
            <h3 class="text-2xl font-heading font-semibold mb-1">Book Your Celebration</h3>
            <p class="text-text-secondary text-sm mb-4">Complete these {{ totalSteps() }} steps to finalize</p>

            <!-- Stepper UI -->
            <div class="flex items-center justify-between relative px-2">
              <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-bg-elevated rounded-full -z-10"></div>
              <div class="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-accent rounded-full -z-10 transition-all duration-300"
                   [style.width]="((currentStep() - 1) / (totalSteps() - 1) * 100) + '%'"></div>
              
              @for (i of stepArray(); track i) {
                <div class="flex flex-col items-center gap-1">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                       [class]="currentStep() >= i ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'bg-bg-elevated text-text-muted border border-border'">
                    {{ i }}
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Body (Scrollable) -->
          <div class="flex-1 overflow-y-auto overscroll-contain px-1 min-h-[40vh] custom-scrollbar pb-4" (wheel)="$event.stopPropagation()" (touchmove)="$event.stopPropagation()">
            
            <!-- Step 1: Theatre -->
            @if (currentStep() === 1) {
              <div class="space-y-4 animate-fade-in">
                <h4 class="text-lg font-medium text-text-primary mb-4">Select Theatre</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  @for (theatre of theatres; track theatre) {
                    <label class="relative cursor-pointer group">
                      <input type="radio" name="theatre" class="peer sr-only" 
                             [value]="theatre" [(ngModel)]="form.selectedTheatre" 
                             (change)="onTheatreSelect()">
                      <div class="p-5 border-2 rounded-xl transition-all duration-300"
                           [class]="form.selectedTheatre === theatre ? 'border-accent bg-accent/5' : 'border-border bg-bg-elevated group-hover:border-accent/50'">
                        <div class="flex justify-between items-center mb-2">
                          <span class="font-semibold text-text-primary group-hover:text-accent transition-colors">{{ theatre }}</span>
                          <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                               [class]="form.selectedTheatre === theatre ? 'border-accent' : 'border-border'">
                            <div class="w-2.5 h-2.5 rounded-full bg-accent transition-transform duration-200"
                                 [class.scale-100]="form.selectedTheatre === theatre"
                                 [class.scale-0]="form.selectedTheatre !== theatre"></div>
                          </div>
                        </div>
                        <p class="text-xs text-text-muted">
                          @if (theatre === 'Jubilee Theatre') {
                            10-15 members capacity
                          } @else if (theatre === 'Golden Cage Theatre') {
                            4-5 members capacity
                          } @else {
                            Premium celebration space
                          }
                        </p>
                      </div>
                    </label>
                  }
                </div>
              </div>
            }

            <!-- Step 2: Service -->
            @if (!isPreSelectedService() && currentStep() === 2) {
              <div class="space-y-4 animate-fade-in">
                <h4 class="text-lg font-medium text-text-primary mb-4">Select Package</h4>
                @if (filteredServices().length === 0) {
                  <p class="text-text-muted text-sm p-4 bg-bg-elevated rounded-xl">No packages available for this theatre.</p>
                } @else {
                  <div class="grid grid-cols-1 gap-3">
                    @for (svc of filteredServices(); track svc.id) {
                      <label class="relative cursor-pointer group">
                        <input type="radio" name="service" class="peer sr-only" 
                               [value]="svc" [(ngModel)]="form.selectedService"
                               (change)="onServiceSelect()">
                        <div class="p-4 border-2 rounded-xl transition-all duration-300 flex items-center gap-4"
                             [class]="form.selectedService?.id === svc.id ? 'border-accent bg-accent/5' : 'border-border bg-bg-elevated group-hover:border-accent/50'">
                           
                           @if (svc.imageUrl) {
                             <div class="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-border">
                               <img [src]="svc.imageUrl | imageUrl" class="w-full h-full object-cover" alt="">
                             </div>
                           }
                           
                           <div class="flex-1 min-w-0">
                             <div class="font-semibold text-text-primary truncate">{{ svc.title }}</div>
                             <div class="text-xs text-text-secondary mt-1 line-clamp-1">{{ svc.description }}</div>
                             <div class="text-accent text-sm font-bold mt-1">{{ svc.price }}</div>
                           </div>
                           
                           <div class="w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors"
                                [class]="form.selectedService?.id === svc.id ? 'border-accent' : 'border-border'">
                             <div class="w-2.5 h-2.5 rounded-full bg-accent transition-transform duration-200"
                                  [class.scale-100]="form.selectedService?.id === svc.id"
                                  [class.scale-0]="form.selectedService?.id !== svc.id"></div>
                           </div>
                        </div>
                      </label>
                    }
                  </div>
                }
              </div>
            }

            <!-- Step 3: Addons -->
            @if (currentStep() === (isPreSelectedService() ? 2 : 3)) {
              <div class="space-y-4 animate-fade-in">
                <h4 class="text-lg font-medium text-text-primary mb-4">Enhance Your Experience (Optional)</h4>
                @if (addons().length === 0) {
                  <p class="text-text-muted text-sm">No add-ons available.</p>
                } @else {
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    @for (addon of addons(); track addon.id) {
                      <label class="relative cursor-pointer group">
                        <input type="checkbox" class="peer sr-only" 
                               [checked]="isAddonSelected(addon)"
                               (change)="toggleAddon(addon, $event)">
                        <div class="p-4 border-2 rounded-xl transition-all duration-300 flex items-center gap-3"
                             [class]="isAddonSelected(addon) ? 'border-accent bg-accent/5' : 'border-border bg-bg-elevated group-hover:border-accent/50'">
                           
                           <div class="flex-1 min-w-0">
                             <div class="font-medium text-text-primary text-sm truncate">{{ addon.title }}</div>
                             <div class="text-accent text-xs font-bold mt-0.5">{{ addon.price }}</div>
                           </div>
                           
                           <div class="w-5 h-5 shrink-0 rounded border flex items-center justify-center transition-colors"
                                [class]="isAddonSelected(addon) ? 'border-accent bg-accent text-white' : 'border-border'">
                             @if (isAddonSelected(addon)) {
                               <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                             }
                           </div>
                        </div>
                      </label>
                    }
                  </div>
                }
              </div>
            }

            <!-- Step 4: Date & Time -->
            @if (currentStep() === (isPreSelectedService() ? 3 : 4)) {
              <div class="space-y-5 animate-fade-in pt-2">
                <div>
                  <label class="block text-sm font-medium text-text-secondary mb-1.5">Event Date *</label>
                  <input
                    type="date"
                    [(ngModel)]="form.eventDate"
                    name="eventDate"
                    class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-text-secondary mb-1.5">Slot Duration *</label>
                  <select
                    [(ngModel)]="form.slotDuration"
                    name="slotDuration"
                    class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
                  >
                    <option value="">Select duration</option>
                    <option value="1 hour">1 hour</option>
                    <option value="2 hours">2 hours</option>
                    <option value="3 hours">3 hours</option>
                    <option value="4 hours">4 hours</option>
                    <option value="5+ hours">5+ hours</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-text-secondary mb-1.5">Preferred Time *</label>
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
              </div>
            }

            <!-- Step 5: Details -->
            @if (currentStep() === (isPreSelectedService() ? 4 : 5)) {
              <div class="space-y-4 animate-fade-in pt-2">
                <div>
                  <label class="block text-sm font-medium text-text-secondary mb-1.5">Your Name *</label>
                  <input
                    type="text"
                    [(ngModel)]="form.customerName"
                    name="customerName"
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
                    class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-border focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
                    placeholder="9876543210"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-text-secondary mb-1.5">Special Notes</label>
                  <textarea
                    [(ngModel)]="form.notes"
                    name="notes"
                    rows="2"
                    class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-border focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all resize-none"
                    placeholder="Any special requirements..."
                  ></textarea>
                </div>
              </div>
            }
          </div>

          <!-- Footer Actions -->
          <div class="shrink-0 pt-6 mt-2 border-t border-border flex items-center justify-between gap-4">
            @if (currentStep() > 1) {
              <button class="btn-ghost !px-6 !py-3 !rounded-xl" (click)="prevStep()">Back</button>
            } @else {
              <div></div>
            }
            
            @if (currentStep() < totalSteps()) {
              <button class="btn-primary !px-8 !py-3 !rounded-xl" (click)="nextStep()" [disabled]="!canProceed()">Next Step</button>
            } @else {
              <button
                class="btn-primary !px-8 !py-3 !rounded-xl flex items-center gap-2"
                [disabled]="!canProceed() || submitting()"
                (click)="submitBooking()"
              >
                <app-icon name="whatsapp" [size]="20"></app-icon>
                <span>{{ submitting() ? 'Submitting...' : 'Book via WhatsApp' }}</span>
              </button>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
    }
    .custom-scrollbar:hover::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
    }
  `
})
export class BookingModalComponent implements OnInit {
  public bookingService = inject(BookingService);
  private api = inject(ApiService);

  submitting = signal(false);
  whatsappNumber = signal('919990863647');
  messageTemplate = signal('');

  services = signal<SparkService[]>([]);
  addons = signal<Addon[]>([]);
  theatres = ['Golden Cage Theatre', 'Jubilee Theatre'];

  isPreSelectedService = computed(() => !!this.bookingService.selectedService());
  totalSteps = computed(() => this.isPreSelectedService() ? 4 : 5);
  stepArray = computed(() => Array.from({ length: this.totalSteps() }, (_, i) => i + 1));
  currentStep = signal(1);

  form = {
    selectedTheatre: '',
    selectedService: null as SparkService | null,
    selectedAddons: [] as Addon[],
    customerName: '',
    mobile: '',
    eventDate: '',
    slotDuration: '',
    preferredTime: '',
    notes: '',
  };

  filteredServices = computed(() => {
    const all = this.services();
    const t = this.form.selectedTheatre;
    if (!t) return all;
    return all.filter(s => {
      // if availableVenues is null/empty, assume available everywhere, else filter
      if (!s.availableVenues || s.availableVenues.length === 0) return true;
      return s.availableVenues.includes(t);
    });
  });

  constructor() {
    // When the modal opens, reset form and prefill if a service was passed
    effect(() => {
      const isOpen = this.bookingService.isOpen();
      const svc = this.bookingService.selectedService();

      if (isOpen) {
        // Fetch services and addons if not already loaded
        if (this.services().length === 0) {
          this.api.getAllServices().subscribe({
            next: (data: SparkService[]) => this.services.set(data.filter(s => s.bookingEnabled && s.isActive)),
            error: () => { },
          });
        }
        if (this.addons().length === 0) {
          this.api.getAddons().subscribe({
            next: (data: Addon[]) => this.addons.set(data.filter((a: Addon) => a.isActive)),
            error: () => { },
          });
        }

        this.resetForm();
        if (svc) {
          this.form.selectedService = svc;
          // Auto-select theatre if service only has 1 venue configured
          if (svc.availableVenues && svc.availableVenues.length === 1) {
            this.form.selectedTheatre = svc.availableVenues[0];
            this.currentStep.set(2); // jump to addons (now Step 2)
          } else {
            // Let them select theatre, but remember service
            this.currentStep.set(1);
          }
        }
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.api.getSettings().subscribe({
      next: (settings: SiteSettings) => {
        if (settings.whatsapp) {
          this.whatsappNumber.set(settings.whatsapp.number);
          this.messageTemplate.set(settings.whatsapp.messageTemplate);
        }
      },
      error: () => { },
    });
  }

  close(): void {
    this.bookingService.close();
  }

  onTheatreSelect(): void {
    // If the currently selected service isn't available in this theatre, clear it
    if (this.form.selectedService) {
      const svc = this.form.selectedService;
      if (svc.availableVenues && svc.availableVenues.length > 0 && !svc.availableVenues.includes(this.form.selectedTheatre)) {
        this.form.selectedService = null;
      }
    }
  }

  onServiceSelect(): void {
    // Optional logic when service is selected
  }

  isAddonSelected(addon: Addon): boolean {
    return this.form.selectedAddons.some(a => a.id === addon.id);
  }

  toggleAddon(addon: Addon, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      if (!this.isAddonSelected(addon)) {
        this.form.selectedAddons.push(addon);
      }
    } else {
      this.form.selectedAddons = this.form.selectedAddons.filter(a => a.id !== addon.id);
    }
  }

  canProceed(): boolean {
    const s = this.currentStep();
    const isPre = this.isPreSelectedService();

    if (s === 1) return !!this.form.selectedTheatre;
    if (!isPre && s === 2) return !!this.form.selectedService;

    // Addons step (Step 2 if pre-selected, Step 3 if not)
    if (s === (isPre ? 2 : 3)) return true;

    // Date & Time step
    if (s === (isPre ? 3 : 4)) return !!this.form.eventDate && !!this.form.slotDuration && !!this.form.preferredTime;

    // Details step
    if (s === (isPre ? 4 : 5)) return !!this.form.customerName && !!this.form.mobile;

    return false;
  }

  nextStep(): void {
    if (this.canProceed() && this.currentStep() < this.totalSteps()) {
      this.currentStep.update(v => v + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(v => v - 1);
    }
  }

  async submitBooking(): Promise<void> {
    if (!this.canProceed()) return;
    this.submitting.set(true);

    const serviceName = this.form.selectedService?.title || 'General Inquiry';
    const notesStr = `Duration: ${this.form.slotDuration}\nTheatre: ${this.form.selectedTheatre}\nAddons: ${this.form.selectedAddons.map(a => a.title).join(', ') || 'None'}\nNotes: ${this.form.notes}`;

    this.api.submitBooking({
      customerName: this.form.customerName,
      mobile: this.form.mobile,
      serviceName,
      eventDate: this.form.eventDate,
      preferredTime: this.form.preferredTime || null,
      notes: notesStr,
    }).subscribe({
      next: () => {
        this.redirectToWhatsApp(serviceName, notesStr);
        this.submitting.set(false);
        this.close();
      },
      error: () => {
        this.redirectToWhatsApp(serviceName, notesStr);
        this.submitting.set(false);
        this.close();
      },
    });
  }

  private redirectToWhatsApp(serviceName: string, finalNotes: string): void {
    let message = this.messageTemplate() || this.getDefaultMessage(serviceName, finalNotes);

    message = message
      .replace('{serviceName}', serviceName)
      .replace('{customerName}', this.form.customerName)
      .replace('{mobile}', this.form.mobile)
      .replace('{eventDate}', this.form.eventDate)
      .replace('{preferredTime}', this.form.preferredTime || 'Not specified')
      .replace('{notes}', finalNotes || 'None');

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${this.whatsappNumber()}?text=${encoded}`;
    window.open(url, '_blank');
  }

  private getDefaultMessage(serviceName: string, notes: string): string {
    return `Hello Spark Celebrations,\nI would like to book:\n*${serviceName}*\n\nCustomer Name: ${this.form.customerName}\nMobile: ${this.form.mobile}\nDate: ${this.form.eventDate}\nTime: ${this.form.preferredTime || 'Not specified'}\n\n${notes}`;
  }

  private resetForm(): void {
    this.currentStep.set(1);
    this.form = {
      selectedTheatre: '',
      selectedService: null,
      selectedAddons: [],
      customerName: '',
      mobile: '',
      eventDate: '',
      slotDuration: '',
      preferredTime: '',
      notes: '',
    };
  }
}
