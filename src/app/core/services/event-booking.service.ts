import { Injectable, signal } from '@angular/core';

import { EventDecorItem } from '../models/index';

@Injectable({
  providedIn: 'root'
})
export class EventBookingService {
  isOpen = signal(false);
  
  // We can pass the initial type if we want to open directly to events or decors
  initialType = signal<'event' | 'decor' | null>(null);
  initialItem = signal<EventDecorItem | null>(null);

  open(type?: 'event' | 'decor', item?: EventDecorItem): void {
    this.initialType.set(type || null);
    this.initialItem.set(item || null);
    this.isOpen.set(true);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  close(): void {
    this.isOpen.set(false);
    this.initialType.set(null);
    this.initialItem.set(null);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }
}
