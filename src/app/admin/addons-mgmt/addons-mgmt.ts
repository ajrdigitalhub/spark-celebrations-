import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Addon } from '../../core/models/index';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-addons-mgmt',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="max-w-6xl mx-auto space-y-6">
      
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-heading font-bold text-text-primary">Add-ons Management</h1>
          <p class="text-text-muted mt-1">Manage extra services and custom add-ons</p>
        </div>
        <button class="btn-primary flex items-center gap-2" (click)="openModal()">
          <app-icon name="plus" [size]="18"></app-icon> Add New
        </button>
      </div>

      <!-- Addons List -->
      <div class="bg-bg-surface border border-border rounded-2xl overflow-hidden shadow-card">
        @if (isLoading()) {
          <div class="p-8 text-center text-text-muted">Loading add-ons...</div>
        } @else if (addons().length === 0) {
          <div class="p-8 text-center text-text-muted">No add-ons found. Click "Add New" to create one.</div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-border bg-bg-elevated/50 text-sm font-semibold text-text-secondary">
                  <th class="p-4 w-16">Status</th>
                  <th class="p-4">Title</th>
                  <th class="p-4">Price Note</th>
                  <th class="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                @for (addon of addons(); track addon.id) {
                  <tr class="hover:bg-bg-elevated/20 transition-colors">
                    <td class="p-4">
                      <div class="w-3 h-3 rounded-full mx-auto" [class.bg-success]="addon.isActive" [class.bg-error]="!addon.isActive"></div>
                    </td>
                    <td class="p-4">
                      <div class="font-medium text-text-primary">{{ addon.title }}</div>
                      <div class="text-xs text-text-muted mt-1">{{ addon.description }}</div>
                    </td>
                    <td class="p-4 text-text-secondary text-sm">
                      {{ addon.price || 'N/A' }}
                    </td>
                    <td class="p-4 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button class="w-8 h-8 rounded-lg bg-bg-elevated hover:bg-accent-subtle hover:text-accent flex items-center justify-center transition-colors text-text-muted" (click)="editAddon(addon)">
                          <app-icon name="edit" [size]="16"></app-icon>
                        </button>
                        <button class="w-8 h-8 rounded-lg bg-bg-elevated hover:bg-error/10 hover:text-error flex items-center justify-center transition-colors text-text-muted" (click)="deleteAddon(addon.id)">
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
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="bg-bg-surface border border-border rounded-2xl w-full max-w-lg shadow-elevated overflow-hidden animate-fade-in-up">
          
          <div class="px-6 py-4 border-b border-border flex items-center justify-between bg-bg-elevated/50">
            <h2 class="text-lg font-heading font-semibold text-text-primary">
              {{ editingAddon() ? 'Edit Add-on' : 'New Add-on' }}
            </h2>
            <button class="text-text-muted hover:text-text-primary transition-colors" (click)="closeModal()">
              <app-icon name="x" [size]="20"></app-icon>
            </button>
          </div>

          <form (ngSubmit)="saveAddon()" class="p-6 space-y-4">
            
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
              <label class="block text-sm font-medium text-text-secondary mb-1">Price Note (e.g., "From ₹500")</label>
              <input type="text" [(ngModel)]="form.price" name="price" class="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-xl text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all">
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
                {{ saving() ? 'Saving...' : 'Save Add-on' }}
              </button>
            </div>
          </form>

        </div>
      </div>
    }
  `
})
export class AddonsMgmtComponent implements OnInit {
  private api = inject(ApiService);
  
  addons = signal<Addon[]>([]);
  isLoading = signal(true);
  
  isModalOpen = signal(false);
  editingAddon = signal<Addon | null>(null);
  saving = signal(false);

  form = {
    title: '',
    description: '',
    price: '',
    isActive: true,
    sortOrder: 0
  };

  ngOnInit() {
    this.loadAddons();
  }

  loadAddons() {
    this.isLoading.set(true);
    this.api.getAddons(true).subscribe({
      next: (data) => {
        this.addons.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load addons', err);
        this.isLoading.set(false);
      }
    });
  }

  openModal() {
    this.editingAddon.set(null);
    this.form = {
      title: '',
      description: '',
      price: '',
      isActive: true,
      sortOrder: this.addons().length
    };
    this.isModalOpen.set(true);
  }

  editAddon(addon: Addon) {
    this.editingAddon.set(addon);
    this.form = {
      title: addon.title,
      description: addon.description || '',
      price: addon.price || '',
      isActive: addon.isActive,
      sortOrder: addon.sortOrder
    };
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  saveAddon() {
    if (!this.form.title) return;
    
    this.saving.set(true);
    const id = this.editingAddon()?.id;

    const payload = {
      title: this.form.title,
      description: this.form.description,
      price: this.form.price,
      isActive: this.form.isActive,
      sortOrder: this.form.sortOrder
    };

    const req$ = id ? this.api.updateAddon(id, payload) : this.api.createAddon(payload);
    
    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadAddons();
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }

  deleteAddon(id: string) {
    if (confirm('Are you sure you want to delete this add-on?')) {
      this.api.deleteAddon(id).subscribe(() => this.loadAddons());
    }
  }
}
