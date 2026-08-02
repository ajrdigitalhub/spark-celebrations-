import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Booking } from '../../core/models/index';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-bookings-mgmt',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-heading font-semibold">Bookings</h1>
        <!-- Status Filter -->
        <select [(ngModel)]="statusFilter" (ngModelChange)="filterBookings()" class="px-4 py-2 bg-bg-elevated border border-border rounded-xl text-text-primary text-sm focus:border-accent-border focus:outline-none transition-all">
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div class="glass rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-border">
                <th class="px-6 py-3 text-left text-xs uppercase tracking-wider text-text-muted font-medium">Customer</th>
                <th class="px-6 py-3 text-left text-xs uppercase tracking-wider text-text-muted font-medium">Service</th>
                <th class="px-6 py-3 text-left text-xs uppercase tracking-wider text-text-muted font-medium">Date</th>
                <th class="px-6 py-3 text-left text-xs uppercase tracking-wider text-text-muted font-medium">Mobile</th>
                <th class="px-6 py-3 text-left text-xs uppercase tracking-wider text-text-muted font-medium">Status</th>
                <th class="px-6 py-3 text-right text-xs uppercase tracking-wider text-text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (booking of bookings(); track booking.id) {
                <tr class="border-b border-border hover:bg-bg-elevated/50 transition-colors">
                  <td class="px-6 py-4 text-sm text-text-primary">{{ booking.customerName }}</td>
                  <td class="px-6 py-4 text-sm text-text-secondary">{{ booking.serviceName }}</td>
                  <td class="px-6 py-4 text-sm text-text-secondary">{{ booking.eventDate }}</td>
                  <td class="px-6 py-4">
                    <a [href]="'tel:' + booking.mobile" class="text-sm text-accent hover:underline">{{ booking.mobile }}</a>
                  </td>
                  <td class="px-6 py-4">
                    <select
                      [ngModel]="booking.status"
                      (ngModelChange)="updateStatus(booking, $event)"
                      class="px-2 py-1 bg-bg-elevated border border-border rounded-lg text-xs text-text-primary focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <a
                      [href]="'https://wa.me/' + booking.mobile"
                      target="_blank"
                      class="px-3 py-1.5 text-xs bg-[#25D366]/10 text-[#25D366] rounded-lg hover:bg-[#25D366]/20 transition-colors inline-flex items-center gap-1"
                    >
                      <app-icon name="whatsapp" [size]="14"></app-icon> WhatsApp
                    </a>
                  </td>
                </tr>
              }
              @if (bookings().length === 0) {
                <tr>
                  <td colspan="6" class="px-6 py-12 text-center text-text-muted text-sm">No bookings found</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class BookingsMgmtComponent implements OnInit {
  private api = inject(ApiService);

  bookings = signal<Booking[]>([]);
  statusFilter = 'all';

  ngOnInit(): void { this.loadBookings(); }

  loadBookings(): void {
    this.api.getBookings(this.statusFilter).subscribe({
      next: (data) => this.bookings.set(data),
      error: () => {},
    });
  }

  filterBookings(): void { this.loadBookings(); }

  updateStatus(booking: Booking, status: string): void {
    this.api.updateBookingStatus(booking.id, status).subscribe({
      next: () => this.loadBookings(),
      error: () => {},
    });
  }
}
