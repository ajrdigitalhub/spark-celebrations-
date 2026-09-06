import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { EventBookingService } from '../../../core/services/event-booking.service';
import { EventDecorItem, SiteSettings } from '../../../core/models/index';
import { IconComponent } from '../icon/icon.component';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';

@Component({
  selector: 'app-event-booking-modal',
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
            <h3 class="text-xl sm:text-2xl font-heading font-bold mb-1 text-accent">{{ getStepQuote() }}</h3>
            <p class="text-text-secondary text-sm mb-4 font-medium uppercase tracking-wider">Book Events & Decors</p>

            <!-- Stepper UI -->
            <div class="flex items-center justify-between relative px-2">
              <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-bg-elevated rounded-full -z-10"></div>
              <div class="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-accent rounded-full -z-10 transition-all duration-300"
                   [style.width]="((currentStep() - 1) / (totalSteps() - 1) * 100) + '%'"></div>
              
              @for (i of stepArray(); track i) {
                <div class="flex flex-col items-center gap-1">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                       [class]="currentStep() >= i ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'bg-bg-elevated text-text-muted border border-border'">
                    {{ getStepEmoji(i) }}
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Body (Scrollable) -->
          <div class="flex-1 overflow-y-auto overscroll-contain px-1 min-h-[40vh] custom-scrollbar pb-4" (wheel)="$event.stopPropagation()" (touchmove)="$event.stopPropagation()">
            
            <!-- Step 1: Select Type -->
            @if (!isPreSelectedType() && !isPreSelectedItem() && currentStep() === 1) {
              <div class="space-y-4 animate-fade-in">
                <h4 class="text-lg font-medium text-text-primary mb-4">What are you looking for?</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- Event Card -->
                  <label class="relative cursor-pointer group">
                    <input type="radio" name="type" class="peer sr-only" value="event" [(ngModel)]="form.selectedType">
                    <div class="p-6 border-2 rounded-xl transition-all duration-300 flex flex-col items-center text-center gap-4 h-full"
                         [class]="form.selectedType === 'event' ? 'border-accent bg-accent/5' : 'border-border bg-bg-elevated group-hover:border-accent/50'">
                       <div class="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                         <app-icon name="party" [size]="32"></app-icon>
                       </div>
                       <div>
                         <div class="font-bold text-lg text-text-primary">Events</div>
                         <div class="text-sm text-text-secondary mt-1">Book a complete event package</div>
                       </div>
                    </div>
                  </label>

                  <!-- Decor Card -->
                  <label class="relative cursor-pointer group">
                    <input type="radio" name="type" class="peer sr-only" value="decor" [(ngModel)]="form.selectedType">
                    <div class="p-6 border-2 rounded-xl transition-all duration-300 flex flex-col items-center text-center gap-4 h-full"
                         [class]="form.selectedType === 'decor' ? 'border-accent bg-accent/5' : 'border-border bg-bg-elevated group-hover:border-accent/50'">
                       <div class="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                         <app-icon name="camera" [size]="32"></app-icon>
                       </div>
                       <div>
                         <div class="font-bold text-lg text-text-primary">Decors</div>
                         <div class="text-sm text-text-secondary mt-1">Custom decorations for your space</div>
                       </div>
                    </div>
                  </label>
                </div>
              </div>
            }

            <!-- Step 2: Select Item -->
            @if (!isPreSelectedItem() && currentStep() === (isPreSelectedType() ? 1 : 2)) {
              <div class="space-y-4 animate-fade-in">
                <h4 class="text-lg font-medium text-text-primary mb-4">Select {{ form.selectedType === 'event' ? 'an Event' : 'a Decor' }}</h4>
                @if (filteredItems().length === 0) {
                  <p class="text-text-muted text-sm p-4 bg-bg-elevated rounded-xl">No items available.</p>
                } @else {
                  <div class="grid grid-cols-1 gap-3">
                    @for (item of filteredItems(); track item.id) {
                      <label class="relative cursor-pointer group">
                        <input type="radio" name="item" class="peer sr-only" 
                               [value]="item" [(ngModel)]="form.selectedItem">
                        <div class="p-4 border-2 rounded-xl transition-all duration-300 flex items-center gap-4"
                             [class]="form.selectedItem?.id === item.id ? 'border-accent bg-accent/5' : 'border-border bg-bg-elevated group-hover:border-accent/50'">
                           
                           @if (item.imageUrl) {
                             <div class="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-border">
                               <img [src]="item.imageUrl | imageUrl" class="w-full h-full object-cover" alt="">
                             </div>
                           }
                           
                           <div class="flex-1 min-w-0">
                             <div class="font-semibold text-text-primary truncate">{{ item.title }}</div>
                             <div class="text-xs text-text-secondary mt-1 line-clamp-1">{{ item.description }}</div>
                             @if(item.price) {
                               <div class="text-accent text-sm font-bold mt-1">{{ item.price }}</div>
                             }
                           </div>
                           
                           <div class="w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors"
                                [class]="form.selectedItem?.id === item.id ? 'border-accent' : 'border-border'">
                             <div class="w-2.5 h-2.5 rounded-full bg-accent transition-transform duration-200"
                                  [class.scale-100]="form.selectedItem?.id === item.id"
                                  [class.scale-0]="form.selectedItem?.id !== item.id"></div>
                           </div>
                        </div>
                      </label>
                    }
                  </div>
                }
              </div>
            }

            <!-- Step 3: Details -->
            @if (currentStep() === (isPreSelectedItem() ? 1 : (isPreSelectedType() ? 2 : 3))) {
              <div class="space-y-4 animate-fade-in pt-2">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-text-secondary mb-1.5">Your Name *</label>
                    <input
                      type="text"
                      [(ngModel)]="form.customerName"
                      name="customerName"
                      class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-border focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
                      placeholder="Your Name"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-text-secondary mb-1.5">Mobile Number *</label>
                    <input
                      type="tel"
                      [(ngModel)]="form.mobile"
                      name="mobile"
                      class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-border focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
                      placeholder="Your Number"
                    />
                  </div>
                </div>

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
                  <label class="block text-sm font-medium text-text-secondary mb-1.5">Event Location *</label>
                  <textarea
                    [(ngModel)]="form.location"
                    name="location"
                    rows="2"
                    class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-border focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all resize-none"
                    placeholder="Provide full address or venue name..."
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
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
    .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); }
  `
})
export class EventBookingModalComponent implements OnInit {
  public bookingService = inject(EventBookingService);
  private api = inject(ApiService);

  submitting = signal(false);
  whatsappNumber = signal('919990863647');
  messageTemplate = signal('');

  items = signal<EventDecorItem[]>([]);

  isPreSelectedType = computed(() => !!this.bookingService.initialType());
  isPreSelectedItem = computed(() => !!this.bookingService.initialItem());
  
  totalSteps(): number {
    if (this.isPreSelectedItem()) return 1;
    return this.isPreSelectedType() ? 2 : 3;
  }

  getStepQuote(): string {
    const step = this.currentStep();
    const total = this.totalSteps();
    
    if (total === 1) return "Almost there! Just a few details left... 🚀";
    if (step === total) return "Almost there! Just a few details left... 🚀";
    
    if (total === 3) {
      if (step === 1) return "Let's plan something amazing! 🎉";
      if (step === 2) return "Great choice! Pick your favorite. ✨";
    } else if (total === 2) {
      if (step === 1) return "Great choice! Pick your favorite. ✨";
    }
    
    return "Complete these steps to finalize";
  }

  getStepEmoji(index: number): string {
    const emojis = ['😇', '🥰', '❤️'];
    return emojis[index - 1] || '😇';
  }

  stepArray = computed(() => Array.from({ length: this.totalSteps() }, (_, i) => i + 1));
  currentStep = signal(1);

  form = {
    selectedType: 'event' as 'event' | 'decor' | null,
    selectedItem: null as EventDecorItem | null,
    customerName: '',
    mobile: '',
    eventDate: '',
    location: '',
  };

  filteredItems = computed(() => {
    return this.items().filter(i => i.type === this.form.selectedType);
  });

  constructor() {
    effect(() => {
      const isOpen = this.bookingService.isOpen();
      const type = this.bookingService.initialType();

      if (isOpen) {
        if (this.items().length === 0) {
          this.api.getEventDecors().subscribe({
            next: (data) => this.items.set(data),
            error: () => { },
          });
        }

        this.resetForm();
        if (this.bookingService.initialItem()) {
          this.form.selectedItem = this.bookingService.initialItem();
          this.form.selectedType = this.form.selectedItem!.type;
        } else if (type) {
          this.form.selectedType = type;
        } else {
          this.form.selectedType = null;
        }
      }
    });
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

  canProceed(): boolean {
    const s = this.currentStep();
    const isPre = this.isPreSelectedType();
    const isPreItem = this.isPreSelectedItem();

    if (isPreItem) {
      return !!this.form.customerName && !!this.form.mobile && !!this.form.eventDate && !!this.form.location;
    }

    if (!isPre && s === 1) return !!this.form.selectedType;
    if (s === (isPre ? 1 : 2)) return !!this.form.selectedItem;
    if (s === (isPre ? 2 : 3)) {
      return !!this.form.customerName && !!this.form.mobile && !!this.form.eventDate && !!this.form.location;
    }

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

    const title = this.form.selectedItem?.title || 'Event/Decor';
    const typeLabel = this.form.selectedType === 'event' ? 'Event' : 'Decor';
    const serviceName = `${typeLabel}: ${title}`;
    const notesStr = `Location: ${this.form.location}`;

    this.api.submitBooking({
      customerName: this.form.customerName,
      mobile: this.form.mobile,
      serviceName,
      eventDate: this.form.eventDate,
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
      .replace('{eventDate}', this.formatDate(this.form.eventDate))
      .replace('{preferredTime}', 'Not specified')
      .replace('{notes}', finalNotes || 'None');

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${this.whatsappNumber()}?text=${encoded}`;
    window.open(url, '_blank');
  }

  private getDefaultMessage(serviceName: string, notes: string): string {
    return `Hello Spark Celebrations,\nI would like to book:\n*${serviceName}*\n\nCustomer Name: ${this.form.customerName}\nMobile: ${this.form.mobile}\nDate: ${this.formatDate(this.form.eventDate)}\n\n${notes}`;
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }

  private resetForm(): void {
    this.currentStep.set(1);
    this.form = {
      selectedType: null,
      selectedItem: null,
      customerName: '',
      mobile: '',
      eventDate: '',
      location: '',
    };
  }
}
