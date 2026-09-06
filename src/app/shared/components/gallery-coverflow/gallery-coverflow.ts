import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryImage } from '../../../core/models/index';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';

@Component({
  selector: 'app-gallery-coverflow',
  standalone: true,
  imports: [CommonModule, ImageUrlPipe],
  template: `
    <div class="relative w-full max-w-[1200px] mx-auto py-4 md:py-6">
      <!-- 3D Coverflow (All Devices) -->
      <div class="flex carousel-container relative w-full h-[350px] md:h-[450px] items-center justify-center">
        <div class="scene">
          <div class="a3d" [style.--n]="displayItems.length">
            @for (item of displayItems; track $index; let i = $index) {
              <div class="card group" [style.--i]="i">
                <img [src]="item.imageUrl | imageUrl" [alt]="item.caption || 'Gallery Image'" class="w-full h-full object-cover rounded-2xl">
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .carousel-container {
      overflow: hidden;
    }

    .scene, .a3d { display: grid; }
    
    .scene {
      overflow: hidden;
      perspective: 35em;
      mask: linear-gradient(90deg, #0000, red 10% 90%, #0000);
      -webkit-mask: linear-gradient(90deg, #0000, red 10% 90%, #0000);
      width: 100%;
      height: 100%;
      place-items: center;
    }
    
    .a3d {
      place-self: center;
      transform-style: preserve-3d;
      animation: ry 40s linear infinite;
    }
    
    @keyframes ry {
      to { transform: rotateY(1turn); }
    }
    
    .card {
      --w: 170px;
      @media (min-width: 768px) {
        --w: 280px;
      }
      --ba: calc(1turn / var(--n));
      grid-area: 1 / 1;
      width: var(--w);
      aspect-ratio: 7 / 10;
      border-radius: 1.5em;
      backface-visibility: hidden;
      transform:
        rotateY(calc(var(--i) * var(--ba)))
        translateZ(calc(-1 * (.5 * var(--w) + 1em) / tan(.5 * var(--ba))));
      position: relative;
    }
    
    .hide-scrollbar {
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none; /* Chrome, Safari and Opera */
    }
  `
})
export class GalleryCoverflowComponent implements OnChanges {
  @Input() items: GalleryImage[] = [];
  displayItems: GalleryImage[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items']) {
      let temp = [...this.items];
      // Duplicate items until we have enough to form a large smooth cylinder
      if (temp.length > 0) {
        while (temp.length < 12) {
          temp = [...temp, ...this.items];
        }
      }
      this.displayItems = temp;
    }
  }
}


