import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { EventDecorItem } from '../../core/models/index';
import { ImageCropperService } from '../../core/services/image-cropper.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-events-mgmt',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ImageUrlPipe],
  template: `
    <div class="max-w-6xl mx-auto space-y-6">
      
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-heading font-bold text-text-primary">Events Management</h1>
          <p class="text-text-muted mt-1">Manage your event offerings</p>
        </div>
        <button class="btn-primary flex items-center gap-2" (click)="openModal()">
          <app-icon name="plus" [size]="18"></app-icon> Add Event
        </button>
      </div>

      <!-- List -->
      <div class="bg-bg-surface border border-border rounded-2xl overflow-hidden shadow-card">
        @if (isLoading()) {
          <div class="p-8 text-center text-text-muted">Loading events...</div>
        } @else if (events().length === 0) {
          <div class="p-8 text-center text-text-muted">No events found. Click "Add Event" to create one.</div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-border bg-bg-elevated/50 text-sm font-semibold text-text-secondary">
                  <th class="p-4 w-16">#</th>
                  <th class="p-4 w-16">Status</th>
                  <th class="p-4">Title</th>
                  <th class="p-4">Price</th>
                  <th class="p-4">Sort Order</th>
                  <th class="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                @for (item of events(); track item.id; let i = $index) {
                  <tr class="hover:bg-bg-elevated/20 transition-colors">
                    <td class="p-4 text-sm font-medium text-text-secondary">{{ i + 1 }}</td>
                    <td class="p-4">
                      <div class="w-3 h-3 rounded-full mx-auto" [class.bg-success]="item.isActive" [class.bg-error]="!item.isActive"></div>
                    </td>
                    <td class="p-4">
                      <div class="font-medium text-text-primary">{{ item.title }}</div>
                      <div class="text-xs text-text-muted mt-1">{{ item.description }}</div>
                    </td>
                    <td class="p-4 text-text-secondary text-sm">
                      {{ item.price || 'N/A' }}
                    </td>
                    <td class="p-4 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button class="w-8 h-8 rounded-lg bg-bg-elevated hover:bg-accent/20 text-accent flex items-center justify-center transition-colors border border-border" (click)="editItem(item)" title="Edit">
                          <app-icon name="edit" [size]="16"></app-icon>
                        </button>
                        <button class="w-8 h-8 rounded-lg bg-bg-elevated hover:bg-error/20 text-error flex items-center justify-center transition-colors border border-border" (click)="deleteItem(item.id)" title="Delete">
                          <app-icon name="trash" [size]="16"></app-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
      
    </div>

    <!-- Edit/Create Modal -->
    @if (isModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <div class="bg-bg-surface border border-border rounded-2xl w-full max-w-lg shadow-elevated overflow-hidden animate-fade-in-up my-auto">
          
          <div class="px-6 py-4 border-b border-border flex items-center justify-between bg-bg-elevated/50">
            <h2 class="text-lg font-heading font-semibold text-text-primary">
              {{ editingItem() ? 'Edit Event' : 'New Event' }}
            </h2>
            <button class="text-text-muted hover:text-text-primary transition-colors" (click)="closeModal()">
              <app-icon name="x" [size]="20"></app-icon>
            </button>
          </div>

          <form (ngSubmit)="saveItem()" class="p-6 space-y-4">
            
            <div class="flex items-center gap-3 p-3 bg-bg-elevated rounded-xl border border-border">
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [(ngModel)]="form.isActive" name="isActive" class="sr-only peer">
                <div class="w-11 h-6 bg-bg-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
              </label>
              <span class="text-sm font-medium text-text-primary">Active on Booking Page</span>
            </div>

            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1">Title *</label>
              <input type="text" [(ngModel)]="form.title" name="title" required class="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-xl text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all">
            </div>

            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1">Description</label>
              <textarea [(ngModel)]="form.description" name="description" rows="2" class="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-xl text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all resize-none"></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1">Price (e.g., "From ₹500")</label>
              <input type="text" [(ngModel)]="form.price" name="price" class="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-xl text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all">
            </div>

            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1">Image</label>
              <div class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl">
                <input type="file" accept="image/*" (change)="onImageSelect($event)" class="w-full text-text-primary text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-accent/10 file:text-accent file:font-medium hover:file:bg-accent/20 cursor-pointer" />
              </div>
              @if (selectedFileUrl()) {
                <div class="mt-3 relative w-32 h-24 rounded-lg overflow-hidden border border-border">
                  <img [src]="selectedFileUrl()" alt="Preview" class="w-full h-full object-cover">
                  <div class="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] text-center py-1">New Image</div>
                </div>
              } @else if (editingItem()?.imageUrl) {
                <div class="mt-3 relative w-32 h-24 rounded-lg overflow-hidden border border-border">
                  <img [src]="editingItem()!.imageUrl | imageUrl" alt="Current" class="w-full h-full object-cover">
                  <div class="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] text-center py-1">Current Image</div>
                </div>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1">Sort Order</label>
              <input type="number" [(ngModel)]="form.sortOrder" name="sortOrder" class="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-xl text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all">
            </div>

            <div class="pt-4 flex items-center justify-end gap-3 border-t border-border mt-6">
              <button type="button" class="px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors" (click)="closeModal()">
                Cancel
              </button>
              <button type="submit" [disabled]="saving()" class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                {{ saving() ? 'Saving...' : 'Save Event' }}
              </button>
            </div>
          </form>

        </div>
      </div>
    }
  `
})
export class EventsMgmtComponent implements OnInit {
  private api = inject(ApiService);
  private cropper = inject(ImageCropperService);
  
  items = signal<EventDecorItem[]>([]);
  events = computed(() => this.items().filter(i => i.type === 'event').sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
  isLoading = signal(true);
  
  isModalOpen = signal(false);
  editingItem = signal<EventDecorItem | null>(null);
  saving = signal(false);
  selectedFile = signal<File | null>(null);
  selectedFileUrl = signal<string | null>(null);

  form = {
    title: '',
    description: '',
    price: '',
    imageUrl: '',
    type: 'event' as 'event' | 'decor',
    isActive: true,
    sortOrder: 1
  };

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.isLoading.set(true);
    // Fetch all, filter happens in computed 'events'
    this.api.getEventDecors().subscribe({
      next: (data) => {
        this.items.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load items', err);
        this.isLoading.set(false);
      }
    });
  }

  openModal() {
    this.editingItem.set(null);
    this.form = {
      title: '',
      description: '',
      price: '',
      imageUrl: '',
      type: 'event',
      isActive: true,
      sortOrder: this.events().length + 1
    };
    this.clearPreview();
    this.selectedFile.set(null);
    this.isModalOpen.set(true);
  }

  editItem(item: EventDecorItem) {
    this.editingItem.set(item);
    this.form = {
      title: item.title,
      description: item.description || '',
      price: item.price || '',
      imageUrl: item.imageUrl || '',
      type: 'event', // Force event type
      isActive: item.isActive,
      sortOrder: item.sortOrder
    };
    this.clearPreview();
    this.selectedFile.set(null);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.clearPreview();
    this.isModalOpen.set(false);
  }

  private clearPreview() {
    if (this.selectedFileUrl()) {
      URL.revokeObjectURL(this.selectedFileUrl()!);
      this.selectedFileUrl.set(null);
    }
  }

  async onImageSelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const cropped = await this.cropper.cropImage(input.files[0], 4 / 3);
      if (cropped) {
        this.selectedFile.set(cropped);
        this.clearPreview();
        this.selectedFileUrl.set(URL.createObjectURL(cropped));
      }
      input.value = ''; // Reset input
    }
  }

  async saveItem(): Promise<void> {
    if (!this.form.title) return;
    
    this.saving.set(true);
    const id = this.editingItem()?.id;

    let imageUrl = this.form.imageUrl;
    const fileToUpload = this.selectedFile();
    if (fileToUpload) {
      try {
        const res = await firstValueFrom(this.api.uploadFile(fileToUpload));
        if (res?.url) {
          imageUrl = res.url;
        }
      } catch (e) {
        console.error('Image upload failed', e);
      }
    }

    const payload = {
      title: this.form.title,
      description: this.form.description,
      price: this.form.price,
      imageUrl,
      type: 'event' as const, // Force event type
      isActive: this.form.isActive,
      sortOrder: this.form.sortOrder
    };

    const req$ = id ? this.api.updateEventDecor(id, payload) : this.api.createEventDecor(payload);
    
    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadItems();
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }

  deleteItem(id: string) {
    if (confirm('Are you sure you want to delete this event?')) {
      this.api.deleteEventDecor(id).subscribe(() => this.loadItems());
    }
  }
}
