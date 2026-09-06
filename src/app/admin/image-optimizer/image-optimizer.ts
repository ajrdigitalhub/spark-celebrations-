import { Component, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/components/icon/icon.component';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ProcessedImage {
  id: string;
  originalFile: File;
  originalPreview: string;
  originalSize: number;
  compressedFile?: File;
  compressedPreview?: string;
  compressedSize?: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  errorMsg?: string;
}

@Component({
  selector: 'app-image-optimizer',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold font-heading">Image Optimizer</h1>
          <p class="text-text-muted mt-1">Bulk compress and convert images to WebP entirely in your browser.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Settings Panel -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-bg-surface border border-border p-5 rounded-2xl">
            <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <app-icon name="settings" [size]="20" class="text-accent"></app-icon> Compression Settings
            </h2>
            
            <div class="space-y-5">
              <div>
                <label class="flex justify-between text-sm font-medium text-text-secondary mb-2">
                  <span>Max File Size (MB)</span>
                  <span class="text-text-primary">{{ maxSizeMB() }} MB</span>
                </label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="5" 
                  step="0.1" 
                  [value]="maxSizeMB()"
                  (input)="updateMaxSize($event)"
                  class="w-full accent-accent"
                >
                <p class="text-xs text-text-muted mt-1">Target maximum file size after compression.</p>
              </div>

              <div>
                <label class="flex justify-between text-sm font-medium text-text-secondary mb-2">
                  <span>Max Width/Height (px)</span>
                  <span class="text-text-primary">{{ maxWidthOrHeight() }}px</span>
                </label>
                <input 
                  type="range" 
                  min="800" 
                  max="3840" 
                  step="100" 
                  [value]="maxWidthOrHeight()"
                  (input)="updateMaxWidth($event)"
                  class="w-full accent-accent"
                >
                <p class="text-xs text-text-muted mt-1">Images larger than this will be downscaled.</p>
              </div>

              <div class="pt-4 border-t border-border">
                <button 
                  (click)="processImages()" 
                  [disabled]="!hasPendingImages() || isProcessing()"
                  class="w-full btn-primary flex justify-center items-center gap-2"
                >
                  @if (isProcessing()) {
                    <app-icon name="loader" [size]="18" class="animate-spin"></app-icon> Processing...
                  } @else {
                    <app-icon name="zap" [size]="18"></app-icon> Process Images
                  }
                </button>
              </div>

              <div class="pt-2">
                <button 
                  (click)="downloadAll()" 
                  [disabled]="!hasCompletedImages()"
                  class="w-full btn-secondary flex justify-center items-center gap-2"
                >
                  <app-icon name="download" [size]="18"></app-icon> Download All (ZIP)
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Upload & List Panel -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Dropzone -->
          <div 
            class="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer"
            [class.border-accent]="isDragging()"
            [class.bg-accent-subtle]="isDragging()"
            [class.border-border]="!isDragging()"
            [class.bg-bg-surface]="!isDragging()"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
            (click)="fileInput.click()"
          >
            <input 
              #fileInput 
              type="file" 
              multiple 
              accept="image/png, image/jpeg, image/webp" 
              class="hidden" 
              (change)="onFileSelected($event)"
            >
            <div class="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center mb-4 text-text-muted group-hover:text-accent transition-colors">
              <app-icon name="upload-cloud" [size]="32"></app-icon>
            </div>
            <h3 class="text-lg font-semibold mb-2">Drop images here or click to browse</h3>
            <p class="text-text-muted text-sm max-w-sm">
              Select multiple PNG or JPG files to optimize. They will be converted to highly compressed WebP.
            </p>
          </div>

          <!-- Image List -->
          @if (images().length > 0) {
            <div class="bg-bg-surface border border-border rounded-2xl overflow-hidden">
              <div class="px-5 py-4 border-b border-border flex justify-between items-center bg-bg-elevated/50">
                <h3 class="font-semibold text-sm">Processing Queue ({{ images().length }})</h3>
                <button (click)="clearAll()" class="text-xs text-error hover:text-error/80 font-medium">Clear All</button>
              </div>
              <div class="divide-y divide-border max-h-[500px] overflow-y-auto">
                @for (img of images(); track img.id) {
                  <div class="p-4 flex items-center gap-4 hover:bg-bg-elevated/30 transition-colors">
                    <!-- Preview -->
                    <div class="w-16 h-16 rounded-lg overflow-hidden bg-black flex-shrink-0">
                      <img [src]="img.originalPreview" class="w-full h-full object-cover">
                    </div>
                    
                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                      <div class="flex justify-between items-start mb-1">
                        <h4 class="text-sm font-medium truncate pr-4">{{ img.originalFile.name }}</h4>
                        <!-- Status Badge -->
                        @if (img.status === 'done') {
                          <span class="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-green-400 bg-green-400/10 px-2 py-1 rounded">
                            <app-icon name="check" [size]="12"></app-icon> Done
                          </span>
                        } @else if (img.status === 'processing') {
                          <span class="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-accent bg-accent/10 px-2 py-1 rounded">
                            <app-icon name="loader" [size]="12" class="animate-spin"></app-icon> Processing
                          </span>
                        } @else if (img.status === 'error') {
                          <span class="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-error bg-error/10 px-2 py-1 rounded">
                            <app-icon name="alert-circle" [size]="12"></app-icon> Error
                          </span>
                        } @else {
                          <span class="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-text-muted bg-bg-elevated px-2 py-1 rounded">
                            Waiting
                          </span>
                        }
                      </div>
                      
                      <!-- Sizes -->
                      <div class="flex items-center gap-3 text-xs text-text-muted mt-2">
                        <span>{{ formatSize(img.originalSize) }}</span>
                        @if (img.status === 'done' && img.compressedSize) {
                          <app-icon name="arrow-right" [size]="12" class="text-text-secondary"></app-icon>
                          <span class="text-green-400 font-medium">{{ formatSize(img.compressedSize) }}</span>
                          <span class="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            -{{ getSavingsPercent(img.originalSize, img.compressedSize) }}%
                          </span>
                        }
                      </div>
                      @if (img.errorMsg) {
                        <p class="text-xs text-error mt-1">{{ img.errorMsg }}</p>
                      }
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-2">
                      @if (img.status === 'done' && img.compressedFile) {
                        <button (click)="downloadSingle(img)" class="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors" title="Download">
                          <app-icon name="download" [size]="16"></app-icon>
                        </button>
                      }
                      <button (click)="removeImage(img.id)" class="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center text-text-secondary hover:text-error hover:bg-error/10 transition-colors" title="Remove">
                        <app-icon name="trash-2" [size]="16"></app-icon>
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ImageOptimizerComponent {
  maxSizeMB = signal(0.5); // Default 500KB
  maxWidthOrHeight = signal(1920); // Default Full HD
  
  images = signal<ProcessedImage[]>([]);
  isDragging = signal(false);
  isProcessing = signal(false);

  updateMaxSize(event: Event) {
    this.maxSizeMB.set(parseFloat((event.target as HTMLInputElement).value));
  }

  updateMaxWidth(event: Event) {
    this.maxWidthOrHeight.set(parseInt((event.target as HTMLInputElement).value, 10));
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    
    if (event.dataTransfer?.files) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
      input.value = ''; // Reset
    }
  }

  private handleFiles(files: File[]) {
    const newImages = files
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        id: Math.random().toString(36).substring(2, 9),
        originalFile: file,
        originalPreview: URL.createObjectURL(file),
        originalSize: file.size,
        status: 'pending' as const
      }));
      
    this.images.update(imgs => [...imgs, ...newImages]);
  }

  removeImage(id: string) {
    this.images.update(imgs => imgs.filter(img => img.id !== id));
  }

  clearAll() {
    this.images.set([]);
  }

  hasPendingImages(): boolean {
    return this.images().some(img => img.status === 'pending' || img.status === 'error');
  }

  hasCompletedImages(): boolean {
    return this.images().some(img => img.status === 'done');
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getSavingsPercent(original: number, compressed: number): number {
    return Math.round(((original - compressed) / original) * 100);
  }

  async processImages() {
    this.isProcessing.set(true);
    
    const pendingImages = this.images().filter(img => img.status === 'pending' || img.status === 'error');
    
    for (const img of pendingImages) {
      this.updateImageStatus(img.id, 'processing');
      
      try {
        const options = {
          maxSizeMB: this.maxSizeMB(),
          maxWidthOrHeight: this.maxWidthOrHeight(),
          useWebWorker: true,
          fileType: 'image/webp' as const
        };
        
        const compressedFile = await imageCompression(img.originalFile, options);
        
        this.updateImage(img.id, {
          status: 'done',
          compressedFile,
          compressedPreview: URL.createObjectURL(compressedFile),
          compressedSize: compressedFile.size
        });
      } catch (error) {
        console.error('Compression error:', error);
        this.updateImage(img.id, {
          status: 'error',
          errorMsg: 'Failed to compress image'
        });
      }
    }
    
    this.isProcessing.set(false);
  }

  private updateImageStatus(id: string, status: ProcessedImage['status']) {
    this.images.update(imgs => 
      imgs.map(img => img.id === id ? { ...img, status } : img)
    );
  }

  private updateImage(id: string, updates: Partial<ProcessedImage>) {
    this.images.update(imgs => 
      imgs.map(img => img.id === id ? { ...img, ...updates } : img)
    );
  }

  downloadSingle(img: ProcessedImage) {
    if (!img.compressedFile) return;
    
    const originalName = img.originalFile.name;
    const newName = originalName.substring(0, originalName.lastIndexOf('.')) + '.webp';
    
    saveAs(img.compressedFile, newName);
  }

  async downloadAll() {
    const completed = this.images().filter(img => img.status === 'done' && img.compressedFile);
    if (completed.length === 0) return;
    
    const zip = new JSZip();
    
    completed.forEach(img => {
      const originalName = img.originalFile.name;
      const newName = originalName.substring(0, originalName.lastIndexOf('.')) + '.webp';
      zip.file(newName, img.compressedFile!);
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'optimized-images.zip');
  }
}
