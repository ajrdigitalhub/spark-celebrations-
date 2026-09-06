import { Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { ApiService } from '../../core/services/api.service';
import { HeroItem } from '../../core/models';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-hero-mgmt',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent, ImageUrlPipe, ImageCropperComponent],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold font-heading text-text-primary mb-2">Hero Section Management</h1>
          <p class="text-text-secondary">Upload images or videos and manage captions for the homepage hero carousel.</p>
        </div>
        <button (click)="openModal()" class="btn-primary flex items-center gap-2">
          <app-icon name="plus" [size]="20"></app-icon>
          <span>Add Hero Item</span>
        </button>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <div class="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      }

      <!-- Grid of Items -->
      @if (!loading() && items().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (item of items(); track item.id) {
            <div class="bg-bg-elevated rounded-xl border border-border overflow-hidden group">
              <!-- Preview -->
              <div class="aspect-video relative bg-black flex items-center justify-center overflow-hidden">
                @if (item.mediaType === 'image') {
                  <img [src]="item.mediaUrl | imageUrl" alt="Hero" class="w-full h-full object-cover">
                } @else if (item.mediaType === 'video') {
                  <video [src]="item.mediaUrl | imageUrl" class="w-full h-full object-cover" muted loop playsinline autoplay></video>
                }
                
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button (click)="openModal(item)" class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur">
                    <app-icon name="edit" [size]="20"></app-icon>
                  </button>
                  <button (click)="deleteItem(item.id)" class="w-10 h-10 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white backdrop-blur">
                    <app-icon name="trash" [size]="20"></app-icon>
                  </button>
                </div>

                @if (!item.isActive) {
                  <div class="absolute top-3 right-3 px-2 py-1 bg-black/80 text-white text-xs rounded backdrop-blur">Hidden</div>
                }
              </div>

              <!-- Details -->
              <div class="p-4">
                <p class="text-sm text-text-secondary line-clamp-2" [class.italic]="!item.caption">
                  {{ item.caption || 'No caption provided' }}
                </p>
                <div class="flex items-center justify-between mt-4">
                  <span class="text-xs px-2 py-1 bg-bg-surface rounded text-text-secondary uppercase">
                    {{ item.mediaType }}
                  </span>
                  <button (click)="toggleActive(item)" class="text-xs flex items-center gap-1" [class.text-accent]="item.isActive" [class.text-text-muted]="!item.isActive">
                    <app-icon [name]="item.isActive ? 'eye' : 'eye-off'" [size]="16"></app-icon>
                    {{ item.isActive ? 'Visible' : 'Hidden' }}
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      @if (!loading() && items().length === 0) {
        <div class="text-center py-20 bg-bg-elevated rounded-xl border border-border border-dashed">
          <app-icon name="image" [size]="48" class="text-text-muted mx-auto mb-4"></app-icon>
          <h3 class="text-lg font-medium text-text-primary mb-2">No hero items yet</h3>
          <p class="text-text-secondary mb-6">Add your first image or video to the hero carousel.</p>
          <button (click)="openModal()" class="btn-primary">Add Item</button>
        </div>
      }
    </div>

    <!-- Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="closeModal()"></div>
        <div class="relative bg-bg-elevated rounded-2xl w-full max-w-lg shadow-2xl border border-border animate-fade-in-up max-h-[90vh] flex flex-col">
          <div class="flex justify-between items-center p-6 border-b border-border shrink-0">
            <h2 class="text-xl font-heading font-semibold text-text-primary">
              {{ editingId() ? 'Edit Hero Item' : 'Add Hero Item' }}
            </h2>
            <button (click)="closeModal()" class="text-text-muted hover:text-text-primary transition-colors">
              <app-icon name="x" [size]="24"></app-icon>
            </button>
          </div>

          <form [formGroup]="itemForm" (ngSubmit)="onSubmit()" class="p-6 overflow-y-auto flex-1 min-h-0">
            <!-- Media Upload -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-text-secondary mb-2">Desktop Media File (Landscape)</label>
              
              @if (previewUrl()) {
                <div class="relative aspect-video rounded-xl overflow-hidden bg-black mb-3 group">
                  @if (itemForm.value.mediaType === 'image') {
                    <img [src]="previewUrl()" class="w-full h-full object-contain">
                  } @else {
                    <video [src]="previewUrl()" class="w-full h-full object-contain" controls></video>
                  }
                  <button type="button" (click)="removeMedia()" class="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <app-icon name="x" [size]="16"></app-icon>
                  </button>
                </div>
              } @else {
                <div class="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent hover:bg-accent/5 transition-colors cursor-pointer relative">
                  <input type="file" (change)="onFileSelected($event)" accept="image/*,video/mp4,video/webm" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                  <app-icon name="upload" [size]="32" class="text-accent mx-auto mb-3"></app-icon>
                  <p class="text-text-primary font-medium mb-1">Click or drag file to upload</p>
                  <p class="text-text-muted text-xs">Supports JPG, PNG, WEBP, MP4</p>
                  
                  @if (uploading()) {
                    <div class="absolute inset-0 bg-bg-elevated/90 flex flex-col items-center justify-center rounded-xl">
                      <div class="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin mb-2"></div>
                      <span class="text-sm font-medium text-accent">Uploading...</span>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Mobile Media Upload -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-text-secondary mb-2">Mobile Media File (Portrait) - Optional</label>
              
              @if (imageChangedEvent) {
                <div class="mb-4 bg-black rounded-xl overflow-hidden p-4 border border-border">
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="text-white font-medium">Crop Portrait Image (9:16)</h3>
                    <button type="button" (click)="cancelCrop()" class="text-white/60 hover:text-white px-2 py-1">Cancel</button>
                  </div>
                  <div class="h-64 sm:h-80 w-full relative">
                    <image-cropper
                      [imageChangedEvent]="imageChangedEvent"
                      [maintainAspectRatio]="true"
                      [aspectRatio]="9 / 16"
                      format="webp"
                      (imageCropped)="imageCropped($event)"
                      style="max-height: 100%; max-width: 100%;"
                    ></image-cropper>
                  </div>
                  <div class="mt-4 flex justify-end">
                    <button type="button" (click)="saveCrop()" class="btn-primary !py-2 !px-4 !text-sm">Save Crop</button>
                  </div>
                </div>
              } @else if (mobilePreviewUrl()) {
                <div class="relative aspect-[9/16] rounded-xl overflow-hidden bg-black mb-3 group max-h-64 mx-auto w-fit">
                  @if (itemForm.value.mediaType === 'image') {
                    <img [src]="mobilePreviewUrl()" class="w-full h-full object-contain">
                  } @else {
                    <video [src]="mobilePreviewUrl()" class="w-full h-full object-contain" controls></video>
                  }
                  <button type="button" (click)="removeMobileMedia()" class="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <app-icon name="x" [size]="16"></app-icon>
                  </button>
                </div>
              } @else {
                <div class="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent hover:bg-accent/5 transition-colors cursor-pointer relative">
                  <input type="file" (change)="onMobileFileSelected($event)" accept="image/*,video/mp4,video/webm" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                  <app-icon name="upload" [size]="32" class="text-accent mx-auto mb-3"></app-icon>
                  <p class="text-text-primary font-medium mb-1">Click or drag mobile file to upload</p>
                  <p class="text-text-muted text-xs">Supports JPG, PNG, WEBP, MP4</p>
                  
                  @if (uploadingMobile()) {
                    <div class="absolute inset-0 bg-bg-elevated/90 flex flex-col items-center justify-center rounded-xl">
                      <div class="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin mb-2"></div>
                      <span class="text-sm font-medium text-accent">Uploading...</span>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Caption -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-text-secondary mb-2">Caption (Optional)</label>
              <textarea 
                formControlName="caption" 
                rows="3" 
                class="w-full bg-bg-surface border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
                placeholder="Enter a captivating caption for this slide..."
              ></textarea>
            </div>

            <!-- Active Toggle -->
            <div class="flex items-center gap-3">
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" formControlName="isActive" class="sr-only peer">
                <div class="w-11 h-6 bg-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                <span class="ml-3 text-sm font-medium text-text-secondary">Visible on homepage</span>
              </label>
            </div>

            <div class="flex justify-end gap-3 mt-8">
              <button type="button" (click)="closeModal()" class="px-5 py-2.5 rounded-xl border border-border text-text-primary hover:bg-bg-surface transition-colors">
                Cancel
              </button>
              <button type="submit" [disabled]="(!itemForm.value.mediaUrl && !selectedFile()) || saving()" class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                @if (saving()) {
                  <div class="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin"></div>
                }
                <span>{{ saving() ? 'Saving...' : (editingId() ? 'Update' : 'Add Item') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class HeroMgmtComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  items = signal<HeroItem[]>([]);
  loading = signal(true);
  
  showModal = signal(false);
  editingId = signal<string | null>(null);
  saving = signal(false);
  uploading = signal(false);
  previewUrl = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  mobilePreviewUrl = signal<string | null>(null);
  selectedMobileFile = signal<File | null>(null);
  uploadingMobile = signal(false);

  imageChangedEvent: any = '';
  croppedBlob: Blob | null | undefined = null;
  croppedObjectUrl: string | null | undefined = null;

  itemForm: FormGroup = this.fb.group({
    mediaUrl: [''],
    mobileMediaUrl: [''],
    mediaType: ['image', Validators.required],
    caption: [''],
    isActive: [true]
  });

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.loading.set(true);
    this.api.getHeroItems().subscribe({
      next: (data) => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openModal(item?: HeroItem) {
    if (item) {
      this.editingId.set(item.id);
      this.itemForm.patchValue({
        mediaUrl: item.mediaUrl,
        mobileMediaUrl: item.mobileMediaUrl,
        mediaType: item.mediaType,
        caption: item.caption,
        isActive: item.isActive
      });
      this.previewUrl.set(this.api.getImageUrl(item.mediaUrl));
      this.mobilePreviewUrl.set(item.mobileMediaUrl ? this.api.getImageUrl(item.mobileMediaUrl) : null);
    } else {
      this.editingId.set(null);
      this.itemForm.reset({ isActive: true, mediaType: 'image' });
      this.previewUrl.set(null);
      this.selectedFile.set(null);
      this.mobilePreviewUrl.set(null);
      this.selectedMobileFile.set(null);
    }
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.itemForm.reset();
    this.previewUrl.set(null);
    this.selectedFile.set(null);
    this.mobilePreviewUrl.set(null);
    this.selectedMobileFile.set(null);
    this.cancelCrop();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0] as File;
    if (!file) return;

    // Validate size (50MB max for video, less for images)
    if (file.size > 50 * 1024 * 1024) {
      alert('File is too large. Maximum size is 50MB.');
      return;
    }

    const isVideo = file.type.startsWith('video/');
    
    this.selectedFile.set(file);
    this.itemForm.patchValue({ mediaType: isVideo ? 'video' : 'image' });

    // Create local preview
    if (this.previewUrl()) {
      URL.revokeObjectURL(this.previewUrl()!);
    }
    this.previewUrl.set(URL.createObjectURL(file));
  }

  removeMedia() {
    this.previewUrl.set(null);
    this.selectedFile.set(null);
    this.itemForm.patchValue({ mediaUrl: '' });
  }

  onMobileFileSelected(event: any) {
    const file = event.target.files[0] as File;
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('File is too large. Maximum size is 50MB.');
      return;
    }
    
    // If it's an image, trigger cropper. If video, use directly.
    if (file.type.startsWith('image/')) {
      this.imageChangedEvent = event;
    } else {
      this.selectedMobileFile.set(file);
      if (this.mobilePreviewUrl()) {
        URL.revokeObjectURL(this.mobilePreviewUrl()!);
      }
      this.mobilePreviewUrl.set(URL.createObjectURL(file));
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedBlob = event.blob;
    this.croppedObjectUrl = event.objectUrl;
  }

  saveCrop() {
    if (this.croppedBlob) {
      const file = new File([this.croppedBlob], 'mobile_hero.webp', { type: 'image/webp' });
      this.selectedMobileFile.set(file);
      
      if (this.mobilePreviewUrl()) {
        URL.revokeObjectURL(this.mobilePreviewUrl()!);
      }
      
      if (this.croppedObjectUrl) {
        this.mobilePreviewUrl.set(this.croppedObjectUrl);
      } else {
        this.mobilePreviewUrl.set(URL.createObjectURL(this.croppedBlob));
      }
    }
    this.imageChangedEvent = '';
  }

  cancelCrop() {
    this.imageChangedEvent = '';
    this.croppedBlob = null;
    this.croppedObjectUrl = null;
  }

  removeMobileMedia() {
    this.mobilePreviewUrl.set(null);
    this.selectedMobileFile.set(null);
    this.itemForm.patchValue({ mobileMediaUrl: '' });
  }

  async onSubmit() {
    if (!this.itemForm.value.mediaUrl && !this.selectedFile()) return;
    this.saving.set(true);

    try {
      let finalMediaUrl = this.itemForm.value.mediaUrl;
      let finalMobileMediaUrl = this.itemForm.value.mobileMediaUrl;

      // Upload file if new one selected
      const fileToUpload = this.selectedFile();
      if (fileToUpload) {
        this.uploading.set(true);
        const uploadRes = await firstValueFrom(this.api.uploadFile(fileToUpload));
        if (uploadRes) {
          finalMediaUrl = uploadRes.url;
          this.itemForm.patchValue({ mediaUrl: uploadRes.url });
        }
        this.uploading.set(false);
      }

      const mobileFileToUpload = this.selectedMobileFile();
      if (mobileFileToUpload) {
        this.uploadingMobile.set(true);
        const uploadRes = await firstValueFrom(this.api.uploadFile(mobileFileToUpload));
        if (uploadRes) {
          finalMobileMediaUrl = uploadRes.url;
          this.itemForm.patchValue({ mobileMediaUrl: uploadRes.url });
        }
        this.uploadingMobile.set(false);
      }

      const itemData = this.itemForm.value;
      itemData.mediaUrl = finalMediaUrl; // Ensure final media URL is used
      itemData.mobileMediaUrl = finalMobileMediaUrl;

      if (this.editingId()) {
        await firstValueFrom(this.api.updateHeroItem(this.editingId()!, itemData));
      } else {
        await firstValueFrom(this.api.createHeroItem(itemData));
      }

      this.closeModal();
      this.loadItems();
    } catch (error) {
      console.error('Error saving hero item:', error);
      alert('Failed to save item. Please try again.');
    } finally {
      this.saving.set(false);
      this.uploading.set(false);
      this.uploadingMobile.set(false);
    }
  }

  async deleteItem(id: string) {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await firstValueFrom(this.api.deleteHeroItem(id));
        this.loadItems();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  }

  async toggleActive(item: HeroItem) {
    try {
      await firstValueFrom(this.api.updateHeroItem(item.id, { isActive: !item.isActive }));
      this.loadItems();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  }
}
