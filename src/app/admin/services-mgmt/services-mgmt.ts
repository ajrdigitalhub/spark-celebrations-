import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SparkService } from '../../core/models/index';
import { ImageCropperService } from '../../core/services/image-cropper.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-services-mgmt',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ImageUrlPipe],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-heading font-semibold">Services</h1>
        <button class="btn-primary !py-2.5 !px-5 !text-sm !rounded-xl" (click)="openForm()">
          <span>+ Add Service</span>
        </button>
      </div>

      <!-- Services Table -->
      <div class="glass rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-border">
                <th class="px-6 py-3 text-left text-xs uppercase tracking-wider text-text-muted font-medium">Service</th>
                <th class="px-6 py-3 text-left text-xs uppercase tracking-wider text-text-muted font-medium">Price</th>
                <th class="px-6 py-3 text-left text-xs uppercase tracking-wider text-text-muted font-medium">Status</th>
                <th class="px-6 py-3 text-left text-xs uppercase tracking-wider text-text-muted font-medium">Booking</th>
                <th class="px-6 py-3 text-right text-xs uppercase tracking-wider text-text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (service of services(); track service.id) {
                <tr class="border-b border-border hover:bg-bg-elevated/50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-lg bg-bg-elevated flex items-center justify-center text-accent overflow-hidden shrink-0">
                        @if (service.imageUrl) {
                          <img [src]="service.imageUrl | imageUrl" alt="" class="w-full h-full object-cover">
                        } @else {
                          <app-icon [name]="service.title.includes('Birthday') ? 'cake' : 'baby'" [size]="20"></app-icon>
                        }
                      </div>
                      <span class="text-sm font-medium text-text-primary">{{ service.title }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-text-secondary">{{ service.price || '—' }}</td>
                  <td class="px-6 py-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-medium" [class]="service.isActive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'">
                      {{ service.isActive ? 'Active' : 'Hidden' }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-medium" [class]="service.bookingEnabled ? 'bg-accent-subtle text-accent' : 'bg-bg-elevated text-text-muted'">
                      {{ service.bookingEnabled ? 'Enabled' : 'Disabled' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button class="px-3 py-1.5 text-xs bg-bg-elevated rounded-lg text-text-secondary hover:text-accent transition-colors" (click)="editService(service)">
                        Edit
                      </button>
                      <button class="px-3 py-1.5 text-xs bg-bg-elevated rounded-lg text-text-secondary hover:text-error transition-colors" (click)="deleteService(service)">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      @if (formOpen()) {
        <div class="fixed inset-0 z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <!-- Background backdrop -->
          <div class="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" aria-hidden="true" (click)="closeForm()"></div>

          <!-- Scrollable area covering the viewport -->
          <div class="fixed inset-0 z-10 w-screen overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/40">
            <div class="flex min-h-full justify-center p-4 text-center sm:p-0 items-start" (click)="closeForm()">
              
              <!-- Modal panel -->
              <div class="relative transform rounded-2xl bg-bg-surface text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl border border-border mt-10 mb-10" (click)="$event.stopPropagation()">
                
                <!-- Sticky Header -->
                <div class="p-6 pb-4 flex-shrink-0 border-b border-border/50 sticky top-0 bg-bg-surface z-10 rounded-t-2xl">
                  <h3 class="text-xl font-heading font-semibold">{{ editing() ? 'Edit' : 'Add' }} Service</h3>
                </div>
                
                <!-- Body (No internal scrollbar) -->
                <div class="p-6 pt-6">
                  <form (ngSubmit)="saveService()">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                      
                      <!-- Left Column -->
                      <div class="space-y-5">
                        <div>
                          <label class="block text-sm font-medium text-text-secondary mb-1.5">Title *</label>
                          <input type="text" [(ngModel)]="form.title" name="title" required class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all" />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-text-secondary mb-1.5">Description</label>
                          <textarea [(ngModel)]="form.description" name="description" rows="4" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all resize-none"></textarea>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                          <div>
                            <label class="block text-sm font-medium text-text-secondary mb-1.5">Price</label>
                            <input type="text" [(ngModel)]="form.price" name="price" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all" placeholder="₹4,999" />
                          </div>
                          <div>
                            <label class="block text-sm font-medium text-text-secondary mb-1.5">Features</label>
                            <input type="text" [(ngModel)]="form.featuresStr" name="features" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all" placeholder="Comma-separated" />
                          </div>
                        </div>
                      </div>

                      <!-- Right Column -->
                      <div class="space-y-5 flex flex-col">
                        <div>
                          <label class="block text-sm font-medium text-text-secondary mb-1.5">Main Image</label>
                          <div class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl">
                            <input type="file" accept="image/*" (change)="onImageSelect($event)" class="w-full text-text-primary text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-accent/10 file:text-accent file:font-medium hover:file:bg-accent/20 cursor-pointer" />
                          </div>
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-text-secondary mb-1.5">Gallery Images (Multiple)</label>
                          <div class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl">
                            <input type="file" multiple accept="image/*" (change)="onGallerySelect($event)" class="w-full text-text-primary text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-accent/10 file:text-accent file:font-medium hover:file:bg-accent/20 cursor-pointer" />
                          </div>
                          @if (editing() && form.galleryUrls?.length) {
                            <p class="text-xs text-text-muted mt-2">Currently has {{ form.galleryUrls.length }} images. Uploading new ones will add to the gallery.</p>
                          }
                        </div>
                        
                        <div class="pt-2 border-t border-border mt-4">
                          <label class="block text-sm font-medium text-text-secondary mb-3">Available Theatres (Venues)</label>
                          <div class="flex flex-col gap-3">
                            <label class="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" [checked]="form.availableVenues.includes('Golden Cage Theatre')" (change)="toggleVenue('Golden Cage Theatre', $event)" class="w-4 h-4 accent-accent" />
                              <span class="text-sm text-text-primary">Golden Cage Theatre</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" [checked]="form.availableVenues.includes('Jubly Theatre')" (change)="toggleVenue('Jubly Theatre', $event)" class="w-4 h-4 accent-accent" />
                              <span class="text-sm text-text-primary">Jubly Theatre</span>
                            </label>
                          </div>
                        </div>

                        <div class="flex items-center gap-6 pt-4 border-t border-border mt-4">
                          <label class="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" [(ngModel)]="form.isActive" name="isActive" class="w-4 h-4 accent-accent" />
                            <span class="text-sm text-text-secondary">Active</span>
                          </label>
                          <label class="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" [(ngModel)]="form.bookingEnabled" name="bookingEnabled" class="w-4 h-4 accent-accent" />
                            <span class="text-sm text-text-secondary">Booking Enabled</span>
                          </label>
                        </div>
                        
                        <div class="flex gap-3 mt-auto pt-6">
                          <button type="button" class="btn-ghost flex-1 !rounded-xl" (click)="closeForm()">Cancel</button>
                          <button type="submit" class="btn-primary flex-1 !rounded-xl" [disabled]="saving()">
                            <span>{{ saving() ? 'Saving...' : 'Save Service' }}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
        </div>
        </div>
      }
    </div>
  `,
})
export class ServicesMgmtComponent implements OnInit {
  private api = inject(ApiService);
  private cropper = inject(ImageCropperService);

  services = signal<SparkService[]>([]);
  formOpen = signal(false);
  editing = signal(false);
  saving = signal(false);
  editId = '';
  selectedFile: File | null = null;

  form = {
    title: '',
    description: '',
    price: '',
    featuresStr: '',
    isActive: true,
    bookingEnabled: true,
    galleryUrls: [] as string[],
    availableVenues: [] as string[],
  };

  toggleVenue(venue: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      if (!this.form.availableVenues.includes(venue)) {
        this.form.availableVenues.push(venue);
      }
    } else {
      this.form.availableVenues = this.form.availableVenues.filter(v => v !== venue);
    }
  }

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.api.getAllServices().subscribe({
      next: (data) => this.services.set(data),
      error: () => {},
    });
  }

  openForm(): void {
    this.editing.set(false);
    this.form = { title: '', description: '', price: '', featuresStr: '', isActive: true, bookingEnabled: true, galleryUrls: [], availableVenues: [] };
    this.selectedFile = null;
    this.selectedGalleryFiles = [];
    this.formOpen.set(true);
  }

  editService(service: SparkService): void {
    this.editing.set(true);
    this.editId = service.id;
    this.form = {
      title: service.title,
      description: service.description || '',
      price: service.price || '',
      featuresStr: service.features?.join(', ') || '',
      isActive: service.isActive,
      bookingEnabled: service.bookingEnabled,
      galleryUrls: service.galleryUrls || [],
      availableVenues: service.availableVenues || [],
    };
    this.selectedFile = null;
    this.selectedGalleryFiles = [];
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  async onImageSelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const cropped = await this.cropper.cropImage(input.files[0], 4/3);
      if (cropped) {
        this.selectedFile = cropped;
      }
      input.value = ''; // Reset input
    }
  }

  selectedGalleryFiles: File[] = [];
  async onGallerySelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      const newFiles: File[] = [];
      for (const file of files) {
        // Free crop for gallery? User didn't specify. I'll use 4/3 to match main image, or maintainAspectRatio=false.
        // Wait, "their perfect aspect ratio only able to crop services main 4:3 will be best"
        // I will let them free crop the gallery images by passing maintainAspectRatio: false.
        const cropped = await this.cropper.cropImage(file, 1, false);
        if (cropped) {
          newFiles.push(cropped);
        }
      }
      this.selectedGalleryFiles = newFiles;
      input.value = '';
    }
  }

  async saveService(): Promise<void> {
    if (!this.form.title) return;
    this.saving.set(true);

    let imageUrl: string | undefined;
    let newGalleryUrls: string[] = [...(this.form.galleryUrls || [])];

    // Upload main image if selected
    if (this.selectedFile) {
      try {
        const res = await firstValueFrom(this.api.uploadFile(this.selectedFile));
        imageUrl = res?.url;
      } catch (e) {
        console.error('Image upload failed', e);
      }
    }

    // Upload gallery images
    if (this.selectedGalleryFiles.length > 0) {
      for (const file of this.selectedGalleryFiles) {
        try {
          const res = await firstValueFrom(this.api.uploadFile(file));
          if (res?.url) {
            newGalleryUrls.push(res.url);
          }
        } catch (e) {
          console.error('Gallery image upload failed', e);
        }
      }
    }

    const data: Partial<SparkService> = {
      title: this.form.title,
      description: this.form.description || null,
      features: this.form.featuresStr ? this.form.featuresStr.split(',').map((f) => f.trim()) : [],
      price: this.form.price || null,
      isActive: this.form.isActive,
      bookingEnabled: this.form.bookingEnabled,
      galleryUrls: newGalleryUrls,
      availableVenues: this.form.availableVenues,
      ...(imageUrl ? { imageUrl } : {}),
    };

    const obs = this.editing()
      ? this.api.updateService(this.editId, data)
      : this.api.createService(data);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.loadServices();
      },
      error: () => this.saving.set(false),
    });
  }

  deleteService(service: SparkService): void {
    if (confirm(`Delete "${service.title}"?`)) {
      this.api.deleteService(service.id).subscribe({
        next: () => this.loadServices(),
        error: () => {},
      });
    }
  }
}
