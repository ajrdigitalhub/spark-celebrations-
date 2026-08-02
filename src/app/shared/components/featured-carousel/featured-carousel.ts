import { Component, Input, OnInit, OnDestroy, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SparkService } from '../../../core/models/index';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-featured-carousel',
  standalone: true,
  imports: [CommonModule, RouterLink, ImageUrlPipe, IconComponent],
  template: `
    <div class="relative w-full h-[500px] lg:h-[600px] rounded-[2rem] overflow-hidden bg-bg-surface group shadow-2xl" (mouseenter)="pause()" (mouseleave)="resume()">
      
      <!-- Crossfading Backgrounds -->
      @for (item of items; track item.id; let i = $index) {
        <div 
          class="absolute inset-0 transition-opacity duration-1000 ease-in-out z-0"
          [class.opacity-100]="i === currentIndex()"
          [class.opacity-0]="i !== currentIndex()"
        >
          @if (item.imageUrl) {
            <img [src]="item.imageUrl | imageUrl" class="w-full h-full object-cover transform scale-105 transition-transform duration-[10s] ease-linear" [class.scale-110]="i === currentIndex()">
          } @else {
            <div class="w-full h-full bg-bg-elevated flex items-center justify-center">
               <app-icon [name]="item.title.includes('Birthday') ? 'cake' : 'party'" [size]="120" class="text-white/10"></app-icon>
            </div>
          }
        </div>
      }

      <!-- Gradients for text readability -->
      <div class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10 pointer-events-none"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none"></div>
      <!-- Additional Glossy Overlay for theme matching -->
      <div class="absolute inset-0 bg-accent/5 mix-blend-overlay z-10 pointer-events-none"></div>

      <!-- Content (Left Side) -->
      @if (activeItem()) {
        <div class="absolute inset-0 p-8 lg:p-16 flex flex-col justify-center w-full lg:w-[55%] z-20">
          <div 
            class="transition-all duration-700 ease-out flex flex-col items-start"
            [class.translate-y-0]="true"
            [class.opacity-100]="true"
            [attr.key]="currentIndex()"
          >
            <!-- Theme Badge -->
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6 w-fit">
              <span class="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              <span class="text-white text-xs font-medium tracking-wider uppercase">Featured</span>
            </div>

            <!-- Title -->
            <h2 class="text-4xl lg:text-6xl font-heading font-bold text-white mb-4 uppercase tracking-widest leading-tight" style="text-shadow: 0 4px 12px rgba(0,0,0,0.5);">
              {{ activeItem()?.title }}
            </h2>
            
            <!-- Description -->
            <p class="text-white/80 text-lg mb-8 line-clamp-3 leading-relaxed max-w-xl">
              {{ activeItem()?.description }}
            </p>
            
            <!-- Action -->
            <a 
              class="btn-primary !rounded-xl !px-8 !py-3 inline-block"
              [routerLink]="['/services', activeItem()?.id]"
            >
              <span>See Details</span>
            </a>
          </div>
        </div>
      }

      <!-- Cards Stack (Right Side) -->
      <div class="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 gap-6 z-20">
        @for (item of previewItems(); track item.item.id; let i = $index) {
          <div 
            class="w-60 h-80 rounded-[1.5rem] overflow-hidden shadow-2xl border border-white/10 cursor-pointer transition-all duration-500 ease-out relative group/card"
            [style.transform]="'translateY(' + (i * 24) + 'px)'"
            (click)="goTo(item.originalIndex)"
          >
            @if (item.item.imageUrl) {
              <img [src]="item.item.imageUrl | imageUrl" class="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700">
            } @else {
              <div class="w-full h-full bg-bg-elevated flex items-center justify-center">
                <app-icon name="image" [size]="48" class="text-white/20"></app-icon>
              </div>
            }
            
            <!-- Card Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            <div class="absolute inset-0 bg-accent/20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 mix-blend-overlay"></div>
            
            <!-- Card Content -->
            <div class="absolute bottom-6 left-6 right-6">
              <h3 class="text-white font-heading font-semibold text-lg leading-tight">{{ item.item.title }}</h3>
            </div>
          </div>
        }
      </div>

      <!-- Navigation Controls -->
      <div class="absolute bottom-10 right-10 lg:left-16 lg:right-auto flex gap-3 z-30">
        <button 
          (click)="prev()" 
          class="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 backdrop-blur-md flex items-center justify-center text-white transition-all border border-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button 
          (click)="next()" 
          class="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 backdrop-blur-md flex items-center justify-center text-white transition-all border border-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      <!-- Progress Bar (Auto-play indicator) -->
      <div class="absolute bottom-0 left-0 h-1.5 bg-white/10 w-full z-30">
        <div 
          class="h-full bg-gradient-to-r from-accent to-accent-dim transition-all duration-100 ease-linear"
          [style.width.%]="progress()"
        ></div>
      </div>
    </div>
  `,
  styles: `
    /* Small animation reset hack for angular @for keying */
    [key] {
      animation: slideFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes slideFadeIn {
      from {
        opacity: 0;
        transform: translateY(30px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `
})
export class FeaturedCarouselComponent implements OnInit, OnDestroy {
  @Input() items: SparkService[] = [];
  onBookClick = output<SparkService>();

  currentIndex = signal(0);
  progress = signal(0);
  
  private intervalId: any;
  private progressIntervalId: any;
  private readonly AUTO_PLAY_MS = 6000;
  private lastTick = 0;

  activeItem = computed(() => {
    if (!this.items || this.items.length === 0) return null;
    return this.items[this.currentIndex()];
  });

  // Returns the next 2 items to show in the stack
  previewItems = computed(() => {
    if (!this.items || this.items.length <= 1) return [];
    const len = this.items.length;
    const curr = this.currentIndex();
    
    const previews = [];
    const previewCount = Math.min(2, len - 1);
    
    for (let i = 1; i <= previewCount; i++) {
      const originalIndex = (curr + i) % len;
      previews.push({
        item: this.items[originalIndex],
        originalIndex
      });
    }
    return previews;
  });

  ngOnInit() {
    // Only auto-play if we have more than 1 item
    if (this.items && this.items.length > 1) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  next() {
    if (this.items.length <= 1) return;
    this.currentIndex.set((this.currentIndex() + 1) % this.items.length);
    this.resetTimer();
  }

  prev() {
    if (this.items.length <= 1) return;
    this.currentIndex.set((this.currentIndex() - 1 + this.items.length) % this.items.length);
    this.resetTimer();
  }

  goTo(index: number) {
    if (this.items.length <= 1) return;
    this.currentIndex.set(index);
    this.resetTimer();
  }

  pause() {
    this.stopAutoPlay(false); // keep progress bar visually stopped
  }

  resume() {
    if (this.items && this.items.length > 1) {
       this.startAutoPlay(); // resume from where it was
    }
  }

  private startAutoPlay() {
    if (this.items.length <= 1) return;
    
    this.lastTick = Date.now();
    this.progressIntervalId = setInterval(() => {
      const now = Date.now();
      const elapsed = now - this.lastTick;
      const currentProgress = this.progress();
      
      const newProgress = currentProgress + (elapsed / this.AUTO_PLAY_MS) * 100;
      
      if (newProgress >= 100) {
        this.next();
      } else {
        this.progress.set(newProgress);
        this.lastTick = now;
      }
    }, 50); // 20fps for smooth progress bar update
  }

  private stopAutoPlay(resetProgress = true) {
    if (this.progressIntervalId) {
      clearInterval(this.progressIntervalId);
      this.progressIntervalId = null;
    }
    if (resetProgress) {
      this.progress.set(0);
    }
  }

  private resetTimer() {
    this.stopAutoPlay(true);
    this.startAutoPlay();
  }
}
