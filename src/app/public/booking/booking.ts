import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SparkService, SiteSettings, Addon } from '../../core/models/index';
import { IconComponent } from '../../shared/components/icon/icon.component';

interface BookingDate {
  date: Date;
  label: string; // e.g., "Mon", "Tue"
  day: string; // e.g., "3 Aug", "4 Aug"
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  providers: [DatePipe],
  template: `
    <div class="min-h-screen pt-28 pb-24 bg-[#0a0705]">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header & Progress -->
        <div class="mb-10">
          <div class="flex items-center justify-between mb-6">
            <button (click)="goBack()" class="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Cancel Booking
            </button>
            <div class="text-xs font-medium text-[#d4af37] tracking-widest uppercase">Step {{ currentStep() }} of 4</div>
          </div>
          
          <div class="h-1 w-full bg-white/10 rounded-full overflow-hidden mb-6">
            <div class="h-full bg-[#d4af37] transition-all duration-500 ease-out" [style.width]="(currentStep() / 4) * 100 + '%'"></div>
          </div>
          
          <h1 class="text-3xl font-heading font-bold text-white">
            @switch (currentStep()) {
              @case (1) { Choose your private theatre }
              @case (2) { Customize with Add-ons }
              @case (3) { Pick a date & time }
              @case (4) { Your details }
            }
          </h1>
          <p class="text-text-muted mt-2">
            @switch (currentStep()) {
              @case (1) { Your space, your celebration. }
              @case (2) { Make your celebration extra special. }
              @case (3) { Only open, available times can be selected. }
              @case (4) { We'll use these details to confirm your slot. }
            }
          </p>
        </div>

        <!-- Wizard Steps Container -->
        <div class="relative bg-[#140e0a] border border-white/5 rounded-[1.5rem] p-6 lg:p-10 shadow-2xl">
          
          <!-- STEP 1: CHOOSE THEATRE -->
          @if (currentStep() === 1) {
            <div class="animate-fade-in">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                @for (venue of venues; track venue.id) {
                  <div class="relative rounded-2xl border transition-all duration-300 p-6 cursor-pointer flex flex-col"
                       [class.border-[#d4af37]]="selectedVenueId() === venue.id"
                       [class.bg-[#d4af37]/5]="selectedVenueId() === venue.id"
                       [class.border-white/10]="selectedVenueId() !== venue.id"
                       [class.hover:border-white/20]="selectedVenueId() !== venue.id"
                       [class.bg-[#1a130e]]="selectedVenueId() !== venue.id"
                       (click)="selectVenue(venue)">
                    
                    @if (selectedVenueId() === venue.id) {
                      <div class="absolute top-5 right-5 bg-[#d4af37] text-black text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                        <app-icon name="check" [size]="14"></app-icon> Selected
                      </div>
                    } @else {
                      <div class="absolute top-5 right-5 border border-[#d4af37]/40 text-[#d4af37] text-xs font-medium px-4 py-1.5 rounded-full hover:bg-[#d4af37]/10 transition-colors">
                        Select
                      </div>
                    }

                    <h3 class="text-xl font-bold text-white mb-1 pr-28">{{ venue.title }}</h3>
                    <p class="text-xs text-text-muted flex items-center gap-1 mb-5">
                      <app-icon name="map-pin" [size]="12"></app-icon> Spark Celebrations
                    </p>

                    <div class="text-xs text-[#d4af37] font-medium mb-1.5 flex items-center gap-1.5">
                      <app-icon name="clock" [size]="14"></app-icon> 9:00 AM – 11:00 PM
                    </div>
                    @if (venue.price) {
                      <div class="text-sm text-white/80 mb-5 pb-5 border-b border-white/10 flex-grow">From {{ venue.price }}</div>
                    }


                  </div>
                }
              </div>

              <div class="mt-10 flex justify-end">
                <button class="bg-[#d4af37] hover:bg-[#eab351] text-black rounded-full px-8 py-3 text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                        [disabled]="!selectedVenueId()"
                        (click)="setStep(2)">
                  Continue to Add-ons <app-icon name="arrow-right" [size]="16"></app-icon>
                </button>
              </div>
            </div>
          }

          <!-- STEP 2: CHOOSE ADD-ONS -->
          @if (currentStep() === 2) {
            <div class="animate-fade-in">
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                @for (addon of activeAddons(); track addon.id) {
                  <div class="p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col"
                       [class.border-[#d4af37]]="isAddonSelected(addon.id)"
                       [class.bg-[#d4af37]/5]="isAddonSelected(addon.id)"
                       [class.border-white/10]="!isAddonSelected(addon.id)"
                       [class.bg-[#1a130e]]="!isAddonSelected(addon.id)"
                       [class.hover:border-white/30]="!isAddonSelected(addon.id)"
                       (click)="toggleAddon(addon.id)">
                    
                    <div class="flex items-start justify-between mb-1.5">
                      <div class="w-5 h-5 rounded-md border flex items-center justify-center transition-colors"
                           [class.bg-[#d4af37]]="isAddonSelected(addon.id)"
                           [class.border-[#d4af37]]="isAddonSelected(addon.id)"
                           [class.border-white/20]="!isAddonSelected(addon.id)">
                        @if (isAddonSelected(addon.id)) {
                          <app-icon name="check" [size]="12" class="text-black"></app-icon>
                        }
                      </div>
                      <span class="text-xs font-medium text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded-full">{{ addon.price || 'Ask Price' }}</span>
                    </div>
                    <h4 class="text-white text-sm font-medium">{{ addon.title }}</h4>
                    @if (addon.description) {
                      <p class="text-xs text-text-muted leading-relaxed mt-1.5">{{ addon.description }}</p>
                    }
                  </div>
                }
                
                @if (activeAddons().length === 0) {
                  <div class="col-span-full p-12 text-center text-text-muted text-sm border border-white/5 rounded-xl bg-[#1a130e]/50">
                    <app-icon name="info" [size]="24" class="mx-auto mb-3 opacity-50"></app-icon>
                    No add-ons available at the moment.<br>You can continue to the next step.
                  </div>
                }
              </div>

              <div class="mt-10 flex justify-between items-center pt-6 border-t border-white/5">
                <button class="text-text-muted hover:text-white text-sm font-medium flex items-center gap-2 transition-colors" (click)="setStep(1)">
                  <app-icon name="arrow-left" [size]="16"></app-icon> Back
                </button>
                <button class="bg-[#d4af37] hover:bg-[#eab351] text-black rounded-full px-8 py-3 text-sm font-bold flex items-center gap-2 transition-all" (click)="setStep(3)">
                  Continue to Dates <app-icon name="arrow-right" [size]="16"></app-icon>
                </button>
              </div>
            </div>
          }

          <!-- STEP 3: PICK DATE & TIME -->
          @if (currentStep() === 3) {
            <div class="animate-fade-in">
              <label class="block text-sm font-medium text-white mb-4">When are you celebrating? *</label>
              
              <!-- Date Selector (Horizontal Scroll) -->
              <div class="flex gap-3 overflow-x-auto pb-4 hide-scrollbar snap-x">
                @for (d of availableDates(); track d.date.getTime()) {
                  <div class="snap-start shrink-0 w-[120px] p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-start"
                       [class.border-[#d4af37]]="isSelectedDate(d.date)"
                       [class.bg-[#3a2818]]="isSelectedDate(d.date)"
                       [class.border-white/10]="!isSelectedDate(d.date)"
                       [class.bg-[#1a130e]]="!isSelectedDate(d.date)"
                       [class.hover:border-white/30]="!isSelectedDate(d.date)"
                       (click)="selectDate(d.date)">
                    <span class="text-xs mb-1 transition-colors font-medium" [class.text-[#d4af37]]="isSelectedDate(d.date)" [class.text-white/60]="!isSelectedDate(d.date)">{{ d.label }}</span>
                    <span class="text-lg font-bold text-white">{{ d.day }}</span>
                  </div>
                }
                <div class="snap-start shrink-0 w-[120px] p-4 rounded-xl border border-white/10 bg-[#1a130e] hover:border-[#d4af37]/50 hover:bg-[#d4af37]/5 cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors group"
                     (click)="datePicker.click()">
                  <app-icon name="calendar" [size]="20" class="text-white/40 group-hover:text-[#d4af37] transition-colors"></app-icon>
                  <span class="text-xs text-white/60 group-hover:text-white transition-colors">Select date</span>
                  <input #datePicker type="date" class="sr-only" (change)="onDatePick($event)" [min]="minDateString()">
                </div>
              </div>

              <!-- Custom Date Input Fallback visible if selected via picker -->
              <div class="mt-4 relative animate-fade-in" [class.hidden]="!isCustomDateSelected()">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <app-icon name="calendar" [size]="16" class="text-[#d4af37]"></app-icon>
                </div>
                <input type="date" [ngModel]="customDateString()" (ngModelChange)="onCustomDateChange($event)" [min]="minDateString()" class="w-full pl-11 pr-4 py-3.5 bg-[#d4af37]/5 border border-[#d4af37]/30 rounded-xl text-white text-sm focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all">
              </div>

              <!-- Time Slots -->
              @if (selectedDate()) {
                <div class="mt-10 animate-fade-in-up">
                  <label class="block text-sm font-medium text-white mb-4 flex items-center justify-between">
                    <span>Select a time slot *</span>
                    <span class="text-xs text-[#d4af37] bg-[#d4af37]/10 px-2 py-1 rounded-md">{{ selectedDate() | date:'mediumDate' }}</span>
                  </label>
                  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    @for (slot of timeSlots; track slot) {
                      <div class="p-4 rounded-xl border text-center cursor-pointer transition-all text-sm font-bold"
                           [class.border-[#d4af37]]="selectedTime() === slot"
                           [class.bg-[#d4af37]]="selectedTime() === slot"
                           [class.text-black]="selectedTime() === slot"
                           [class.border-white/10]="selectedTime() !== slot"
                           [class.bg-[#1a130e]]="selectedTime() !== slot"
                           [class.text-white]="selectedTime() !== slot"
                           [class.hover:border-white/30]="selectedTime() !== slot"
                           (click)="selectTime(slot)">
                        {{ slot }}
                      </div>
                    }
                  </div>
                </div>
              }

              <div class="mt-12 flex justify-between items-center pt-6 border-t border-white/5">
                <button class="text-text-muted hover:text-white text-sm font-medium flex items-center gap-2 transition-colors" (click)="setStep(2)">
                  <app-icon name="arrow-left" [size]="16"></app-icon> Back
                </button>
                <button class="bg-[#d4af37] hover:bg-[#eab351] text-black rounded-full px-8 py-3 text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                        [disabled]="!selectedDate() || !selectedTime()"
                        (click)="setStep(4)">
                  Continue to Details <app-icon name="arrow-right" [size]="16"></app-icon>
                </button>
              </div>
            </div>
          }

          <!-- STEP 4: YOUR DETAILS -->
          @if (currentStep() === 4) {
            <div class="animate-fade-in">
              <div class="bg-[#1a130e] border border-white/5 p-4 rounded-xl mb-8 flex flex-wrap gap-4 text-sm">
                <div class="flex items-center gap-2 text-white"><app-icon name="map-pin" [size]="14" class="text-[#d4af37]"></app-icon> {{ selectedVenue()?.title }}</div>
                <div class="flex items-center gap-2 text-white"><app-icon name="calendar" [size]="14" class="text-[#d4af37]"></app-icon> {{ selectedDate() | date:'mediumDate' }}</div>
                <div class="flex items-center gap-2 text-white"><app-icon name="clock" [size]="14" class="text-[#d4af37]"></app-icon> {{ selectedTime() }}</div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                <!-- Name -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">Your name *</label>
                  <input type="text" [(ngModel)]="form.customerName" name="name" class="w-full px-4 py-3.5 bg-[#1a130e] border border-white/10 rounded-xl text-white text-sm focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all" placeholder="Enter your full name">
                </div>
                
                <!-- Phone -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">Phone number *</label>
                  <div class="flex">
                    <span class="inline-flex items-center px-4 py-3.5 rounded-l-xl border border-r-0 border-white/10 bg-[#140e0a] text-white/50 text-sm font-medium">
                      +91
                    </span>
                    <input type="tel" [(ngModel)]="form.mobile" name="phone" class="flex-1 w-full px-4 py-3.5 bg-[#1a130e] border border-white/10 rounded-r-xl text-white text-sm focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all" placeholder="10-digit number">
                  </div>
                </div>

                <!-- Celebration Person -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">Celebration Person(s) *</label>
                  <input type="text" [(ngModel)]="form.celebrationPerson" name="person" placeholder="e.g. Jagadeesh, Priya" class="w-full px-4 py-3.5 bg-[#1a130e] border border-white/10 rounded-xl text-white text-sm placeholder-white/20 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all">
                </div>

                <!-- Name on Cake -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">Name on Cake *</label>
                  <input type="text" [(ngModel)]="form.cakeName" name="cake" placeholder="Name to print on cake" class="w-full px-4 py-3.5 bg-[#1a130e] border border-white/10 rounded-xl text-white text-sm placeholder-white/20 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all">
                </div>

                <!-- Promo -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2 flex items-center justify-between">
                    Promo code <span class="text-white/40 font-normal text-xs">(optional)</span>
                  </label>
                  <div class="flex gap-2">
                    <input type="text" [(ngModel)]="form.promo" name="promo" placeholder="e.g. WELCOME50" class="flex-1 px-4 py-3.5 bg-[#1a130e] border border-white/10 rounded-xl text-white text-sm placeholder-white/20 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all uppercase">
                    <button class="bg-[#1a130e] hover:bg-[#2a1f17] border border-white/10 rounded-xl px-5 text-sm font-bold text-[#d4af37] transition-colors">Apply</button>
                  </div>
                </div>

                <!-- Notes -->
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-white mb-2 flex items-center justify-between">
                    Anything we should know? <span class="text-white/40 font-normal text-xs">(optional)</span>
                  </label>
                  <textarea [(ngModel)]="form.notes" name="notes" rows="3" placeholder="Occasion, special setup, or any request..." class="w-full px-4 py-3.5 bg-[#1a130e] border border-white/10 rounded-xl text-white text-sm placeholder-white/20 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all resize-none"></textarea>
                </div>
              </div>
              
              <div class="mt-12 flex justify-between items-center pt-6 border-t border-white/5">
                <button class="text-text-muted hover:text-white text-sm font-medium flex items-center gap-2 transition-colors" (click)="setStep(3)">
                  <app-icon name="arrow-left" [size]="16"></app-icon> Back
                </button>
                <button (click)="submitBooking()" [disabled]="!isFormValid()" class="bg-[#d59c3f] hover:bg-[#eab351] text-black rounded-full px-10 py-3.5 text-sm font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(213,156,63,0.2)] hover:shadow-[0_0_30px_rgba(213,156,63,0.4)] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed">
                  <app-icon name="check-circle" [size]="18"></app-icon> Book this slot
                </button>
              </div>
            </div>
          }

        </div>

      </div>
    </div>
  `,
  styles: `
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .animate-fade-in {
      animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `
})
export class BookingPageComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private datePipe = inject(DatePipe);
  private platformId = inject(PLATFORM_ID);

  services = signal<SparkService[]>([]);
  settings = signal<SiteSettings | null>(null);

  // Stepper State
  currentStep = signal<number>(1);
  
  // Selections
  selectedVenueId = signal<string | null>(null);
  selectedAddons = signal<string[]>([]);
  selectedDate = signal<Date | null>(null);
  selectedTime = signal<string | null>(null);

  // Form State
  form = {
    customerName: '',
    mobile: '',
    celebrationPerson: '',
    cakeName: '',
    promo: '',
    notes: ''
  };

  // UI State
  availableDates = signal<BookingDate[]>([]);
  activeAddons = signal<Addon[]>([]);
  timeSlots = [
    '09:00 AM - 10:00 PM',
    '10:00 AM - 11:00 AM',
    '12:00 PM - 02:00 PM',
    '03:00 PM - 05:00 PM',
    '06:00 PM - 08:00 PM',
    '09:00 PM - 11:00 PM'
  ]; 

  // Venues Data
  venues = [
    {
      id: 'party-theatre',
      title: 'Private Theatre',
      price: '₹1,999',
      features: [
        'Private Theatre Room',
        '2 Hours Duration',
        'Custom Decorations',
        'Premium Sound System',
        'Photo Booth Setup',
        'Complimentary Cake'
      ]
    },
    {
      id: 'open-events',
      title: 'Outdoor Events',
      price: 'Custom Pricing',
      features: [
        'Outdoor Spaces',
        'Flexible Duration',
        'Custom Theme Decorations',
        'PA System',
        'Stage Setup Available',
        'Event Coordination'
      ]
    }
  ];

  ngOnInit(): void {
    this.generateAvailableDates();

    this.api.getSettings().subscribe({
      next: (s) => this.settings.set(s),
      error: () => {}
    });

    this.api.getAddons().subscribe({
      next: (data) => this.activeAddons.set(data),
      error: () => {}
    });

    this.api.getServices().subscribe({
      next: (data) => {
        this.services.set(data);
        this.route.queryParams.subscribe(params => {
          if (params['serviceId']) {
            const venue = this.venues.find(v => v.id === 'party-theatre');
            if (venue) {
              this.selectVenue(venue);
              // Do not auto advance in Wizard mode unless specifically designed
            }
          }
        });
      },
      error: () => {}
    });
  }

  generateAvailableDates() {
    const dates: BookingDate[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      
      let label = this.datePipe.transform(d, 'EEE') || '';
      if (i === 0) label = 'Today';
      if (i === 1) label = 'Tomorrow';

      dates.push({
        date: d,
        label: label,
        day: this.datePipe.transform(d, 'd MMM') || ''
      });
    }
    this.availableDates.set(dates);
  }

  selectedVenue() {
    return this.venues.find(v => v.id === this.selectedVenueId());
  }

  setStep(step: number) {
    this.currentStep.set(step);
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
  }

  selectVenue(venue: any) {
    this.selectedVenueId.set(venue.id);
  }

  toggleAddon(addonId: string) {
    const current = this.selectedAddons();
    if (current.includes(addonId)) {
      this.selectedAddons.set(current.filter(id => id !== addonId));
    } else {
      this.selectedAddons.set([...current, addonId]);
    }
  }

  isAddonSelected(addonId: string): boolean {
    return this.selectedAddons().includes(addonId);
  }

  selectDate(date: Date) {
    const d = new Date(date);
    d.setHours(0,0,0,0);
    this.selectedDate.set(d);
    this.selectedTime.set(null); 
  }

  isSelectedDate(date: Date): boolean {
    const selected = this.selectedDate();
    if (!selected) return false;
    
    const d1 = new Date(date);
    d1.setHours(0,0,0,0);
    const d2 = new Date(selected);
    d2.setHours(0,0,0,0);
    
    return d1.getTime() === d2.getTime();
  }

  selectTime(time: string) {
    this.selectedTime.set(time);
  }

  minDateString(): string {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }

  customDateString(): string {
    const selected = this.selectedDate();
    if (!selected) return '';
    const offset = selected.getTimezoneOffset();
    const localDate = new Date(selected.getTime() - (offset*60*1000));
    return localDate.toISOString().split('T')[0];
  }

  onDatePick(event: any) {
    const val = event.target.value;
    if (val) {
      const d = new Date(val);
      const offset = d.getTimezoneOffset();
      const localDate = new Date(d.getTime() + (offset*60*1000));
      this.selectDate(localDate);
    }
  }

  onCustomDateChange(val: string) {
    if (val) {
      const d = new Date(val);
      const offset = d.getTimezoneOffset();
      const localDate = new Date(d.getTime() + (offset*60*1000));
      this.selectDate(localDate);
    }
  }

  isCustomDateSelected(): boolean {
    const selected = this.selectedDate();
    if (!selected) return false;
    const dates = this.availableDates();
    return !dates.some(d => this.isSelectedDate(d.date));
  }

  isFormValid(): boolean {
    return !!(
      this.selectedVenueId() &&
      this.selectedDate() &&
      this.selectedTime() &&
      this.form.customerName.trim() &&
      this.form.mobile.trim() &&
      this.form.celebrationPerson.trim() &&
      this.form.cakeName.trim()
    );
  }

  goBack() {
    // If they click cancel from step 1, go back to services.
    // Otherwise go to previous step.
    if (this.currentStep() > 1) {
      this.setStep(this.currentStep() - 1);
    } else {
      this.router.navigate(['/services']);
    }
  }

  submitBooking() {
    if (!this.isFormValid()) return;

    const venue = this.selectedVenue();
    const dateStr = this.datePipe.transform(this.selectedDate(), 'longDate');
    const timeStr = this.selectedTime();

    const payload = {
      customerName: this.form.customerName,
      mobile: this.form.mobile,
      serviceName: venue?.title,
      eventDate: dateStr || '',
      preferredTime: timeStr,
      notes: `Occasion/Person: ${this.form.celebrationPerson}. Cake Name: ${this.form.cakeName}. Promo: ${this.form.promo || 'None'}. Notes: ${this.form.notes}`,
      selectedAddons: this.selectedAddons()
    };

    this.api.submitBooking(payload).subscribe({
      next: () => {
        this.redirectToWhatsApp(venue?.title || '', dateStr || '', timeStr || '');
      },
      error: () => {
        this.redirectToWhatsApp(venue?.title || '', dateStr || '', timeStr || '');
      }
    });
  }

  private redirectToWhatsApp(serviceTitle: string, date: string, time: string) {
    const settings = this.settings();
    const baseNumber = settings?.whatsapp?.number || '919876543210';
    const cleanNumber = baseNumber.replace(/[^0-9]/g, '');

    const selectedAddonTitles = this.selectedAddons()
      .map(id => this.activeAddons().find(a => a.id === id)?.title)
      .filter(Boolean)
      .join(', ');

    const message = `Hello Spark Celebrations! I would like to book a private theatre slot:

*Package*: ${serviceTitle}
*Date*: ${date}
*Time*: ${time}
*Add-ons*: ${selectedAddonTitles || 'None selected'}

*My Details:*
*Name*: ${this.form.customerName}
*Phone*: +91 ${this.form.mobile}
*Celebration For*: ${this.form.celebrationPerson}
*Name on Cake*: ${this.form.cakeName}
*Promo Code*: ${this.form.promo || 'N/A'}

${this.form.notes ? '*Additional Notes*:\n' + this.form.notes : ''}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    
    if (isPlatformBrowser(this.platformId)) {
      window.open(whatsappUrl, '_blank');
    }
    
    setTimeout(() => this.router.navigate(['/']), 1000);
  }
}
