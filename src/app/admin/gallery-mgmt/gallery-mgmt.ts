import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { GalleryImage } from '../../core/models/index';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-gallery-mgmt',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ImageUrlPipe],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-heading font-semibold">Gallery</h1>
        <label class="btn-primary !py-2.5 !px-5 !text-sm !rounded-xl cursor-pointer flex items-center gap-2">
          <app-icon name="folder" [size]="16"></app-icon>
          <span>Upload Images</span>
          <input type="file" accept="image/*" multiple (change)="uploadImages($event)" class="hidden" />
        </label>
      </div>

      @if (uploading()) {
        <div class="glass p-4 rounded-xl mb-6 flex items-center gap-3">
          <div class="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          <span class="text-text-secondary text-sm">Uploading images...</span>
        </div>
      }

      <!-- Gallery Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        @for (image of images(); track image.id) {
          <div class="group relative aspect-square rounded-xl overflow-hidden bg-bg-elevated border border-border">
            @if (image.imageUrl) {
              <img [src]="image.imageUrl | imageUrl" alt="" class="w-full h-full object-cover">
            } @else {
              <div class="w-full h-full flex items-center justify-center text-accent">
                <app-icon [name]="getEmoji(image.category)" [size]="32"></app-icon>
              </div>
            }
            <!-- Overlay -->
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button
                class="px-3 py-1.5 bg-error/80 rounded-lg text-white text-xs font-medium hover:bg-error transition-colors"
                (click)="deleteImage(image)"
              >
                Delete
              </button>
            </div>
            <!-- Category Badge / Dropdown -->
            <div class="absolute bottom-2 left-2 right-2">
              <select 
                class="w-full bg-black/70 text-white text-xs rounded-md px-2 py-1 outline-none border border-transparent hover:border-border cursor-pointer appearance-none"
                [ngModel]="image.category"
                (ngModelChange)="updateCategory(image, $event)"
              >
                <option value="general">General</option>
                <option value="birthday">Birthday</option>
                <option value="baby shower">Baby Shower</option>
                <option value="anniversary">Anniversary</option>
              </select>
            </div>
          </div>
        }
      </div>

      @if (images().length === 0 && !uploading()) {
        <div class="text-center py-20 text-text-muted">
          <div class="flex justify-center mb-4"><app-icon name="camera" [size]="48"></app-icon></div>
          <h3 class="text-lg font-heading font-semibold mb-2 text-text-primary">No images yet</h3>
          <p class="text-text-secondary text-sm">Upload images to populate your gallery</p>
        </div>
      }
    </div>
  `,
})
export class GalleryMgmtComponent implements OnInit {
  private api = inject(ApiService);

  images = signal<GalleryImage[]>([]);
  uploading = signal(false);

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    this.api.getGallery().subscribe({
      next: (data) => this.images.set(data),
      error: () => {},
    });
  }

  async uploadImages(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.uploading.set(true);
    const files = Array.from(input.files);

    this.api.uploadMultipleFiles(files).subscribe({
      next: (uploaded) => {
        const galleryImages = uploaded.map((file, i) => ({
          imageUrl: file.url,
          category: 'general',
          caption: file.originalName,
          sortOrder: this.images().length + i,
        }));

        this.api.addGalleryImages(galleryImages).subscribe({
          next: () => {
            this.uploading.set(false);
            this.loadImages();
          },
          error: () => this.uploading.set(false),
        });
      },
      error: () => this.uploading.set(false),
    });

    input.value = '';
  }

  deleteImage(image: GalleryImage): void {
    if (confirm('Delete this image?')) {
      this.api.deleteGalleryImage(image.id).subscribe({
        next: () => this.loadImages(),
        error: () => {},
      });
    }
  }

  updateCategory(image: GalleryImage, newCategory: string): void {
    // Optimistic UI update
    const prev = image.category;
    image.category = newCategory;
    
    this.api.updateGalleryImage(image.id, { category: newCategory }).subscribe({
      error: () => {
        // Revert on error
        image.category = prev;
        alert('Failed to update category');
      }
    });
  }

  getEmoji(category: string): string {
    const map: Record<string, string> = { birthday: 'cake', 'baby shower': 'baby', anniversary: 'heart', general: 'party' };
    return map[category] || 'image';
  }
}
