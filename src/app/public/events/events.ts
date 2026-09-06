import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { EventBookingService } from '../../core/services/event-booking.service';
import { EventDecorItem } from '../../core/models/index';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, IconComponent, ImageUrlPipe],
  template: `
    <div class="min-h-screen pt-32 pb-24 relative overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute inset-0 bg-bg-base -z-20"></div>
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div class="section-container relative z-10">
        <!-- Header -->
        <div class="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <h1 class="text-4xl md:text-5xl font-heading font-bold text-text-primary mb-6">Events & Decors</h1>
          <p class="text-lg text-text-secondary">
            Book complete event packages or choose from our premium custom decorations to make your celebration truly special.
          </p>
        </div>

        @if (isLoading()) {
          <div class="flex justify-center items-center py-20">
            <div class="w-10 h-10 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
          </div>
        } @else {
          <!-- Tabs -->
          <div class="flex justify-center mb-12 animate-fade-in-up" style="animation-delay: 100ms;">
            <div class="inline-flex bg-bg-surface border border-border p-1 rounded-xl shadow-sm">
              <button 
                class="px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300"
                [class.bg-bg-elevated]="activeTab() === 'all'"
                [class.text-text-primary]="activeTab() === 'all'"
                [class.shadow-sm]="activeTab() === 'all'"
                [class.text-text-secondary]="activeTab() !== 'all'"
                [class.hover:text-text-primary]="activeTab() !== 'all'"
                (click)="activeTab.set('all')"
              >
                All
              </button>
              <button 
                class="px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300"
                [class.bg-bg-elevated]="activeTab() === 'event'"
                [class.text-text-primary]="activeTab() === 'event'"
                [class.shadow-sm]="activeTab() === 'event'"
                [class.text-text-secondary]="activeTab() !== 'event'"
                [class.hover:text-text-primary]="activeTab() !== 'event'"
                (click)="activeTab.set('event')"
              >
                Events
              </button>
              <button 
                class="px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300"
                [class.bg-bg-elevated]="activeTab() === 'decor'"
                [class.text-text-primary]="activeTab() === 'decor'"
                [class.shadow-sm]="activeTab() === 'decor'"
                [class.text-text-secondary]="activeTab() !== 'decor'"
                [class.hover:text-text-primary]="activeTab() !== 'decor'"
                (click)="activeTab.set('decor')"
              >
                Decors
              </button>
            </div>
          </div>

          <!-- Grid -->
          @if (filteredItems().length === 0) {
            <div class="text-center py-20 bg-bg-surface/50 border border-border rounded-2xl animate-fade-in">
              <div class="w-16 h-16 bg-bg-elevated rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted">
                <app-icon name="party" [size]="32"></app-icon>
              </div>
              <h3 class="text-xl font-heading font-semibold text-text-primary mb-2">No items found</h3>
              <p class="text-text-secondary">There are currently no events or decors available.</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              @for (item of filteredItems(); track item.id) {
                <div class="bg-bg-surface border border-border rounded-2xl overflow-hidden group hover:border-accent/30 hover:shadow-glow transition-all duration-300 flex flex-col animate-fade-in-up" [style.animation-delay]="($index * 100) + 'ms'">
                  
                  <!-- Image -->
                  <div class="aspect-[4/3] w-full overflow-hidden relative bg-bg-elevated">
                    @if (item.imageUrl) {
                      <img [src]="item.imageUrl | imageUrl" [alt]="item.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                    } @else {
                      <div class="w-full h-full flex items-center justify-center text-text-muted">
                        <app-icon [name]="item.type === 'event' ? 'party' : 'camera'" [size]="48"></app-icon>
                      </div>
                    }
                    
                    <div class="absolute top-4 right-4">
                      <span class="px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider backdrop-blur-md"
                            [class.bg-accent/80]="item.type === 'event'"
                            [class.text-white]="item.type === 'event'"
                            [class.bg-purple-500/80]="item.type === 'decor'"
                            [class.text-white]="item.type === 'decor'">
                        {{ item.type }}
                      </span>
                    </div>
                  </div>

                  <!-- Content -->
                  <div class="p-6 flex flex-col flex-1">
                    <h3 class="text-xl font-heading font-bold text-text-primary mb-2 group-hover:text-accent transition-colors">{{ item.title }}</h3>
                    <p class="text-text-secondary text-sm mb-6 flex-1 line-clamp-2">{{ item.description }}</p>
                    
                    <div class="flex items-center justify-between pt-4 border-t border-border mt-auto">
                      <div class="flex flex-col">
                        <span class="text-xs text-text-muted uppercase tracking-wider font-medium mb-1">Starting From</span>
                        <span class="text-lg font-bold text-text-primary">{{ item.price || 'N/A' }}</span>
                      </div>
                      
                      <button 
                        class="btn-primary !px-5 !py-2.5 rounded-xl shadow-lg shadow-accent/20 flex items-center gap-2 group/btn relative overflow-hidden"
                        (click)="bookItem(item)"
                      >
                        <span class="relative z-10 font-medium">Book Now</span>
                        <app-icon name="arrow-right" [size]="16" class="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1"></app-icon>
                        <div class="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 rounded-xl"></div>
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `
})
export class EventsComponent implements OnInit {
  private api = inject(ApiService);
  private bookingService = inject(EventBookingService);

  items = signal<EventDecorItem[]>([]);
  isLoading = signal(true);
  activeTab = signal<'all' | 'event' | 'decor'>('all');

  filteredItems = computed(() => {
    const tab = this.activeTab();
    if (tab === 'all') return this.items();
    return this.items().filter(item => item.type === tab);
  });

  ngOnInit() {
    this.api.getEventDecors().subscribe({
      next: (data) => {
        // Sort by sortOrder
        this.items.set(data.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  bookItem(item: EventDecorItem) {
    this.bookingService.open(item.type, item);
  }
}
