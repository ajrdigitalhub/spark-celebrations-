import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SparkService } from '../../core/models/index';
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
        <div class="fixed inset-0 z-50 flex items-center justify-center" (click)="closeForm()">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div class="relative w-full max-w-lg bg-bg-surface border border-border rounded-2xl p-8 max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <h3 class="text-xl font-heading font-semibold mb-6">{{ editing() ? 'Edit' : 'Add' }} Service</h3>

            <form (ngSubmit)="saveService()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-text-secondary mb-1.5">Title *</label>
                <input type="text" [(ngModel)]="form.title" name="title" required class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all" />
              </div>
              <div>
                <label class="block text-sm font-medium text-text-secondary mb-1.5">Description</label>
                <textarea [(ngModel)]="form.description" name="description" rows="3" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all resize-none"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-text-secondary mb-1.5">Price</label>
                <input type="text" [(ngModel)]="form.price" name="price" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all" placeholder="₹4,999" />
              </div>
              <div>
                <label class="block text-sm font-medium text-text-secondary mb-1.5">Features (comma-separated)</label>
                <input type="text" [(ngModel)]="form.featuresStr" name="features" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all" placeholder="Private Theatre, 2 Hours, Decorations" />
              </div>
              <div>
                <label class="block text-sm font-medium text-text-secondary mb-1.5">Main Image</label>
                <input type="file" accept="image/*" (change)="onImageSelect($event)" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-accent file:text-bg-primary file:font-medium file:text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium text-text-secondary mb-1.5">Gallery Images (Multiple)</label>
                <input type="file" multiple accept="image/*" (change)="onGallerySelect($event)" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-accent file:text-bg-primary file:font-medium file:text-sm" />
                @if (editing() && form.galleryUrls?.length) {
                  <p class="text-xs text-text-muted mt-2">Currently has {{ form.galleryUrls.length }} images. Uploading new ones will add to the gallery.</p>
                }
              </div>
              <div class="flex items-center gap-6">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="form.isActive" name="isActive" class="w-4 h-4 accent-accent" />
                  <span class="text-sm text-text-secondary">Active</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="form.bookingEnabled" name="bookingEnabled" class="w-4 h-4 accent-accent" />
                  <span class="text-sm text-text-secondary">Booking Enabled</span>
                </label>
              </div>
              <div class="flex gap-3 mt-6">
                <button type="button" class="btn-ghost flex-1 !rounded-xl" (click)="closeForm()">Cancel</button>
                <button type="submit" class="btn-primary flex-1 !rounded-xl" [disabled]="saving()">
                  <span>{{ saving() ? 'Saving...' : 'Save Service' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class ServicesMgmtComponent implements OnInit {
  private api = inject(ApiService);

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
  };

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
    this.form = { title: '', description: '', price: '', featuresStr: '', isActive: true, bookingEnabled: true, galleryUrls: [] };
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
    };
    this.selectedFile = null;
    this.selectedGalleryFiles = [];
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  selectedGalleryFiles: File[] = [];
  onGallerySelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedGalleryFiles = Array.from(input.files);
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
