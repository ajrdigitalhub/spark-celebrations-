import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface CropRequest {
  file: File;
  aspectRatio: number;
  maintainAspectRatio: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ImageCropperService {
  public isOpen = signal(false);
  public currentRequest = signal<CropRequest | null>(null);
  
  private resultSubject = new Subject<File | null>();

  cropImage(file: File, aspectRatio: number = 1, maintainAspectRatio: boolean = true): Promise<File | null> {
    this.currentRequest.set({ file, aspectRatio, maintainAspectRatio });
    this.isOpen.set(true);
    
    return new Promise((resolve) => {
      const subscription = this.resultSubject.subscribe((result) => {
        subscription.unsubscribe();
        this.isOpen.set(false);
        this.currentRequest.set(null);
        resolve(result);
      });
    });
  }

  submitCrop(croppedFile: File): void {
    this.resultSubject.next(croppedFile);
  }

  cancelCrop(): void {
    this.resultSubject.next(null);
  }
}
