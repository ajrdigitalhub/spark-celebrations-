import { Injectable, signal } from '@angular/core';
import { SparkService } from '../models/index';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  isOpen = signal(false);
  selectedService = signal<SparkService | null>(null);

  open(service?: SparkService): void {
    this.selectedService.set(service || null);
    this.isOpen.set(true);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  close(): void {
    this.isOpen.set(false);
    this.selectedService.set(null);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }
}
