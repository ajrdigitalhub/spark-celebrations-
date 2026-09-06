import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { ImageCropperService } from '../../../core/services/image-cropper.service';

@Component({
  selector: 'app-image-cropper-modal',
  standalone: true,
  imports: [CommonModule, ImageCropperComponent],
  template: `
    @if (cropperService.isOpen()) {
      <div class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-bg-surface p-6 rounded-2xl max-w-2xl w-full border border-border shadow-2xl">
          <h3 class="text-lg font-medium text-text-primary mb-4">Crop Image</h3>
          
          <div class="bg-bg-elevated rounded-xl overflow-hidden border border-border h-[50vh] sm:h-[400px]">
            @if (imageFile()) {
              <image-cropper
                [imageFile]="imageFile()!"
                [maintainAspectRatio]="maintainAspectRatio()"
                [aspectRatio]="aspectRatio()"
                format="webp"
                (imageCropped)="imageCropped($event)"
              ></image-cropper>
            }
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button class="btn-ghost" (click)="cancel()">Cancel</button>
            <button class="btn-primary" (click)="confirm()">Confirm Crop</button>
          </div>
        </div>
      </div>
    }
  `
})
export class ImageCropperModalComponent {
  public cropperService = inject(ImageCropperService);

  imageFile = signal<File | null>(null);
  aspectRatio = signal<number>(1);
  maintainAspectRatio = signal<boolean>(true);

  private croppedBlob: Blob | null | undefined = null;

  constructor() {
    effect(() => {
      const req = this.cropperService.currentRequest();
      if (req) {
        this.imageFile.set(req.file);
        this.aspectRatio.set(req.aspectRatio);
        this.maintainAspectRatio.set(req.maintainAspectRatio);
        this.croppedBlob = null;
      } else {
        this.imageFile.set(null);
        this.croppedBlob = null;
      }
    }, { allowSignalWrites: true });
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedBlob = event.blob;
  }

  confirm() {
    if (this.croppedBlob) {
      const origFile = this.imageFile();
      const baseName = origFile ? origFile.name.replace(/\.[^/.]+$/, "") : 'cropped';
      const fileName = `${baseName}.webp`;
      const fileType = 'image/webp';
      
      const file = new File([this.croppedBlob], fileName, { type: fileType });
      this.cropperService.submitCrop(file);
    } else {
      this.cancel();
    }
  }

  cancel() {
    this.cropperService.cancelCrop();
  }
}
