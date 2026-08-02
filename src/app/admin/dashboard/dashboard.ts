import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Booking } from '../../core/models/index';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div>
      <h1 class="text-2xl font-heading font-semibold mb-6">Dashboard</h1>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        @for (stat of dashStats(); track stat.label) {
          <div class="glass p-6 rounded-xl">
            <div class="flex items-center justify-between mb-3">
              <span class="text-accent"><app-icon [name]="stat.iconName" [size]="24"></app-icon></span>
              <span class="text-xs px-2 py-1 rounded-full" [class]="stat.changeClass">{{ stat.change }}</span>
            </div>
            <div class="text-3xl font-heading font-bold text-text-primary mb-1">{{ stat.value }}</div>
            <p class="text-text-muted text-sm">{{ stat.label }}</p>
          </div>
        }
      </div>

      <!-- Recent Bookings -->
      <div class="glass rounded-xl overflow-hidden">
        <div class="p-6 border-b border-border flex items-center justify-between">
          <h3 class="font-heading font-semibold">Recent Bookings</h3>
          <a routerLink="/admin/bookings" class="text-accent text-sm hover:underline">View All →</a>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-border">
                <th class="px-6 py-3 text-left text-xs uppercase tracking-wider text-text-muted font-medium">Customer</th>
                <th class="px-6 py-3 text-left text-xs uppercase tracking-wider text-text-muted font-medium">Service</th>
                <th class="px-6 py-3 text-left text-xs uppercase tracking-wider text-text-muted font-medium">Date</th>
                <th class="px-6 py-3 text-left text-xs uppercase tracking-wider text-text-muted font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              @for (booking of recentBookings(); track booking.id) {
                <tr class="border-b border-border hover:bg-bg-elevated/50 transition-colors">
                  <td class="px-6 py-4 text-sm text-text-primary">{{ booking.customerName }}</td>
                  <td class="px-6 py-4 text-sm text-text-secondary">{{ booking.serviceName }}</td>
                  <td class="px-6 py-4 text-sm text-text-secondary">{{ booking.eventDate }}</td>
                  <td class="px-6 py-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-medium" [class]="getStatusClass(booking.status)">
                      {{ booking.status }}
                    </span>
                  </td>
                </tr>
              }
              @if (recentBookings().length === 0) {
                <tr>
                  <td colspan="4" class="px-6 py-12 text-center text-text-muted text-sm">
                    No bookings yet
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);

  dashStats = signal([
    { iconName: 'calendar', value: '0', label: 'Total Bookings', change: '+0 this week', changeClass: 'bg-success/10 text-success' },
    { iconName: 'party', value: '0', label: 'Active Services', change: 'Live', changeClass: 'bg-accent-subtle text-accent' },
    { iconName: 'camera', value: '0', label: 'Gallery Images', change: 'Uploaded', changeClass: 'bg-blue-500/10 text-blue-400' },
    { iconName: 'star', value: '0', label: 'Testimonials', change: 'Reviews', changeClass: 'bg-purple-500/10 text-purple-400' },
  ]);

  recentBookings = signal<Booking[]>([]);

  ngOnInit(): void {
    // Load bookings count
    this.api.getBookings().subscribe({
      next: (bookings) => {
        this.recentBookings.set(bookings.slice(0, 5));
        this.updateStat(0, bookings.length.toString());
      },
      error: () => {},
    });

    // Load services count
    this.api.getAllServices().subscribe({
      next: (services) => this.updateStat(1, services.length.toString()),
      error: () => {},
    });

    // Load gallery count
    this.api.getGallery().subscribe({
      next: (images) => this.updateStat(2, images.length.toString()),
      error: () => {},
    });

    // Load testimonials count
    this.api.getTestimonials().subscribe({
      next: (testimonials) => this.updateStat(3, testimonials.length.toString()),
      error: () => {},
    });
  }

  private updateStat(index: number, value: string): void {
    const stats = [...this.dashStats()];
    stats[index] = { ...stats[index], value };
    this.dashStats.set(stats);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-warning/10 text-warning',
      contacted: 'bg-blue-500/10 text-blue-400',
      confirmed: 'bg-accent-subtle text-accent',
      completed: 'bg-success/10 text-success',
      cancelled: 'bg-error/10 text-error',
    };
    return map[status] || 'bg-bg-elevated text-text-muted';
  }
}
