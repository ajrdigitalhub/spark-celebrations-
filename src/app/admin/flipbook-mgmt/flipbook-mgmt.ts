import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Flipbook } from '../../core/models/index';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';

@Component({
  selector: 'app-flipbook-mgmt',
  standalone: true,
  imports: [CommonModule, IconComponent, ImageCropperComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-heading font-semibold">Flipbook</h1>
      </div>

      <div class="border-2 border-dashed border-border rounded-2xl p-12 text-center bg-bg-surface hover:bg-bg-hover transition-colors">
          <app-icon name="image" [size]="48" class="text-text-muted mx-auto mb-4"></app-icon>
          <h3 class="text-lg font-medium text-text-primary mb-2">Upload Flipbook Pages</h3>
          <p class="text-sm text-text-secondary mb-6">Select one image to crop it perfectly, or select multiple to append them directly.</p>
          
          <input type="file" #fileInput class="hidden" accept="image/*" [multiple]="uploadTarget() === 'page'" (change)="onFilesSelected($event, fileInput)">
          
          <div class="flex items-center justify-center gap-4">
            <button class="btn-primary" (click)="triggerUpload('page', fileInput)" [disabled]="isUploading()">
              {{ isUploading() && uploadTarget() === 'page' ? 'Uploading...' : 'Add Pages' }}
            </button>
          </div>
      </div>

      <!-- Cropper Modal -->
      @if (showCropper()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div class="bg-bg-surface p-6 rounded-2xl max-w-2xl w-full">
            <h3 class="text-lg font-medium text-text-primary mb-4">Crop Image</h3>
            <p class="text-sm text-text-secondary mb-4">Crop your image to the perfect 5:6 aspect ratio for the flipbook.</p>
            
            <div class="bg-bg-elevated rounded-xl overflow-hidden border border-border h-[400px]">
              <image-cropper
                [imageChangedEvent]="imageChangedEvent()"
                [maintainAspectRatio]="true"
                [aspectRatio]="5 / 6"
                format="jpeg"
                (imageCropped)="imageCropped($event)"
                (imageLoaded)="imageLoaded()"
                (cropperReady)="cropperReady()"
                (loadImageFailed)="loadImageFailed()"
              ></image-cropper>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button class="btn-ghost" (click)="cancelCrop()">Cancel</button>
              <button class="btn-primary" (click)="uploadCroppedImage()">Upload</button>
            </div>
          </div>
        </div>
      }

      @if (currentFlipbook()) {
        <div class="mt-8 border border-border rounded-xl p-6 bg-bg-surface">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-medium text-text-primary">Current Flipbook</h3>
            <div class="flex items-center gap-4">
              <span class="text-sm text-text-secondary flex items-center gap-1">
                <div class="w-2 h-2 rounded-full" [class.bg-success]="currentFlipbook()?.isActive" [class.bg-error]="!currentFlipbook()?.isActive"></div>
                {{ currentFlipbook()?.isActive ? 'Active' : 'Inactive' }}
              </span>
              <button class="text-sm font-medium" [class.text-error]="currentFlipbook()?.isActive" [class.text-success]="!currentFlipbook()?.isActive" (click)="toggleActive()">
                {{ currentFlipbook()?.isActive ? 'Deactivate' : 'Activate' }}
              </button>
              <button class="text-error hover:text-error/80 transition-colors" (click)="deleteFlipbook()">
                <app-icon name="trash" [size]="18"></app-icon>
              </button>
            </div>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
            
            <!-- Front Cover Slot -->
            <div class="relative group aspect-[5/6] bg-bg-elevated rounded-lg overflow-hidden border-2 border-primary/50 flex flex-col items-center justify-center">
              @if (currentFlipbook()?.coverImage) {
                <img [src]="getImageUrl(currentFlipbook()!.coverImage!)" alt="Front Cover" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button class="btn-primary py-1 px-3 text-xs" (click)="triggerUpload('cover', fileInput)">Change</button>
                  <button class="w-8 h-8 rounded-full bg-error/90 text-white flex items-center justify-center hover:bg-error transition-colors" (click)="removeCover('cover')">
                    <app-icon name="trash" [size]="14"></app-icon>
                  </button>
                </div>
              } @else {
                <span class="text-sm text-text-secondary mb-2 text-center px-2">No Front Cover</span>
                <button class="btn-secondary py-1 px-3 text-xs" (click)="triggerUpload('cover', fileInput)">Upload Cover</button>
              }
              <div class="absolute top-0 left-0 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-br-lg">FRONT COVER</div>
            </div>

            <!-- Inner Pages -->
            @for (img of currentFlipbook()?.images; track img; let i = $index) {
              <div class="relative group aspect-[5/6] bg-bg-elevated rounded-lg overflow-hidden border border-border">
                <img [src]="getImageUrl(img)" alt="Page {{i + 1}}" class="w-full h-full object-cover">
                
                <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button class="w-8 h-8 rounded-full bg-error/90 text-white flex items-center justify-center hover:bg-error transition-colors shadow-lg" (click)="deletePage(i)">
                    <app-icon name="trash" [size]="14"></app-icon>
                  </button>
                </div>

                <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                  Page {{ i + 1 }}
                </div>
              </div>
            }

            <!-- Back Cover Slot -->
            <div class="relative group aspect-[5/6] bg-bg-elevated rounded-lg overflow-hidden border-2 border-secondary/50 flex flex-col items-center justify-center">
              @if (currentFlipbook()?.backCoverImage) {
                <img [src]="getImageUrl(currentFlipbook()!.backCoverImage!)" alt="Back Cover" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button class="btn-primary py-1 px-3 text-xs" (click)="triggerUpload('backCover', fileInput)">Change</button>
                  <button class="w-8 h-8 rounded-full bg-error/90 text-white flex items-center justify-center hover:bg-error transition-colors" (click)="removeCover('backCover')">
                    <app-icon name="trash" [size]="14"></app-icon>
                  </button>
                </div>
              } @else {
                <span class="text-sm text-text-secondary mb-2 text-center px-2">No Back Cover</span>
                <button class="btn-secondary py-1 px-3 text-xs" (click)="triggerUpload('backCover', fileInput)">Upload Cover</button>
              }
              <div class="absolute top-0 left-0 bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-br-lg">BACK COVER</div>
            </div>

          </div>
          
          <div class="mt-4 text-sm text-text-muted">
            Uploaded on {{ currentFlipbook()?.createdAt | date:'mediumDate' }}
          </div>
        </div>
      }
    </div>
  `,
})
export class FlipbookMgmtComponent implements OnInit {
  private api = inject(ApiService);

  currentFlipbook = signal<Flipbook | null>(null);
  isUploading = signal(false);

  // Upload Context
  uploadTarget = signal<'page' | 'cover' | 'backCover'>('page');

  // Cropper State
  showCropper = signal(false);
  imageChangedEvent = signal<Event | null>(null);
  croppedImageBlob = signal<Blob | null | undefined>(null);
  currentOriginalFileName = signal<string>('cropped-image.jpg');

  ngOnInit(): void {
    this.loadFlipbook();
  }

  loadFlipbook(): void {
    this.api.getFlipbook().subscribe({
      next: (data) => this.currentFlipbook.set(data),
      error: () => {},
    });
  }

  triggerUpload(target: 'page' | 'cover' | 'backCover', fileInput: HTMLInputElement) {
    this.uploadTarget.set(target);
    // Give Angular a tick to update the [multiple] binding on the input
    setTimeout(() => {
      fileInput.click();
    }, 0);
  }

  onFilesSelected(event: Event, fileInput: HTMLInputElement) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // Single file -> Open Cropper
      if (input.files.length === 1) {
        this.currentOriginalFileName.set(input.files[0].name);
        this.imageChangedEvent.set(event);
        this.showCropper.set(true);
      } 
      // Multiple files -> Upload immediately and append (only valid for pages)
      else if (this.uploadTarget() === 'page') {
        this.isUploading.set(true);
        const filesArray = Array.from(input.files);
        this.uploadMultipleFiles(filesArray);
      }
    }
  }

  // --- Cropper Methods ---
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImageBlob.set(event.blob);
  }
  imageLoaded(image?: LoadedImage) {}
  cropperReady() {}
  loadImageFailed() {
    console.error('Image load failed');
  }

  cancelCrop() {
    this.showCropper.set(false);
    this.imageChangedEvent.set(null);
    this.croppedImageBlob.set(null);
  }

  uploadCroppedImage() {
    const blob = this.croppedImageBlob();
    if (!blob) return;

    this.isUploading.set(true);
    this.showCropper.set(false);
    
    // Create a File from the Blob
    const file = new File([blob], this.currentOriginalFileName(), { type: 'image/jpeg' });
    this.uploadMultipleFiles([file]);
  }

  // --- Upload & API Logic ---
  private uploadMultipleFiles(filesArray: File[]) {
    this.api.uploadMultipleFiles(filesArray).subscribe({
      next: (responses) => {
        const filePaths = responses.map(r => r.url);
        const target = this.uploadTarget();
        const existing = this.currentFlipbook();

        if (target === 'cover' || target === 'backCover') {
          if (!existing) return; // shouldn't happen based on UI
          const updates = target === 'cover' 
            ? { coverImage: filePaths[0] } 
            : { backCoverImage: filePaths[0] };
            
          this.api.updateFlipbookCovers(existing.id, updates).subscribe({
            next: (updatedFb) => {
              this.currentFlipbook.set(updatedFb);
              this.isUploading.set(false);
            },
            error: (err) => {
              console.error('Failed to update cover', err);
              this.isUploading.set(false);
            }
          });
        } 
        else { // target === 'page'
          if (existing) {
            const newImagesArray = [...existing.images, ...filePaths];
            this.api.updateFlipbookImages(existing.id, newImagesArray).subscribe({
              next: (updatedFb) => {
                this.currentFlipbook.set(updatedFb);
                this.isUploading.set(false);
              },
              error: (err) => {
                console.error('Failed to update flipbook', err);
                this.isUploading.set(false);
              }
            });
          } 
          else {
            this.api.uploadFlipbook(filePaths).subscribe({
              next: (newFlipbook) => {
                this.currentFlipbook.set(newFlipbook);
                this.isUploading.set(false);
              },
              error: (err) => {
                console.error('Failed to create flipbook', err);
                this.isUploading.set(false);
              }
            });
          }
        }
      },
      error: (err) => {
        console.error('Failed to upload files', err);
        this.isUploading.set(false);
      }
    });
  }

  removeCover(target: 'cover' | 'backCover') {
    const fb = this.currentFlipbook();
    if (!fb) return;
    
    const updates = target === 'cover' 
      ? { coverImage: null as any } // Pass null to remove
      : { backCoverImage: null as any };
      
    this.api.updateFlipbookCovers(fb.id, updates).subscribe({
      next: (updatedFb) => {
        this.currentFlipbook.set(updatedFb);
      }
    });
  }

  deletePage(index: number) {
    const fb = this.currentFlipbook();
    if (!fb) return;

    // Remove the image at the given index
    const newImagesArray = fb.images.filter((_, i) => i !== index);

    this.api.updateFlipbookImages(fb.id, newImagesArray).subscribe({
      next: (updatedFb) => {
        this.currentFlipbook.set(updatedFb);
      },
      error: (err) => {
        console.error('Failed to delete page', err);
      }
    });
  }

  toggleActive() {
    const fb = this.currentFlipbook();
    if (!fb) return;
    this.api.toggleFlipbook(fb.id, !fb.isActive).subscribe({
      next: () => this.loadFlipbook(),
      error: () => {},
    });
  }

  deleteFlipbook() {
    const fb = this.currentFlipbook();
    if (!fb) return;
    this.api.deleteFlipbook(fb.id).subscribe(() => {
      this.currentFlipbook.set(null);
      this.loadFlipbook();
    });
  }

  getImageUrl(path: string): string {
    return this.api.getImageUrl(path);
  }
}
