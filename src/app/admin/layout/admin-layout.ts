import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <div class="flex min-h-screen bg-bg-primary">
      <!-- Sidebar -->
      <aside
        class="fixed lg:sticky top-0 left-0 h-screen w-64 bg-bg-surface border-r border-border flex flex-col z-50 transition-transform duration-300"
        [class.-translate-x-full]="!sidebarOpen()"
        [class.translate-x-0]="sidebarOpen()"
      >
        <!-- Logo -->
        <div class="p-6 border-b border-border">
          <a routerLink="/admin/dashboard" class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-dim flex items-center justify-center">
              <span class="text-bg-primary font-bold text-sm font-heading">S</span>
            </div>
            <div>
              <span class="font-heading font-semibold text-sm text-text-primary block">Spark Admin</span>
              <span class="text-text-muted text-xs">Management Panel</span>
            </div>
          </a>
        </div>

        <!-- Nav Links -->
        <nav class="flex-1 py-4 overflow-y-auto">
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="admin-nav-active"
              [routerLinkActiveOptions]="{ exact: item.exact }"
              class="admin-nav-item flex items-center gap-3 px-6 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-all duration-200"
              (click)="closeSidebarMobile()"
            >
              <app-icon [name]="item.icon" [size]="18"></app-icon>
              {{ item.label }}
            </a>
          }
        </nav>

        <!-- Bottom Actions -->
        <div class="p-4 border-t border-border">
          <a routerLink="/" class="flex items-center gap-3 px-3 py-2 text-text-muted text-sm hover:text-accent transition-colors rounded-lg hover:bg-bg-elevated">
            <app-icon name="globe" [size]="18"></app-icon> View Website
          </a>
          <button
            (click)="logout()"
            class="w-full flex items-center gap-3 px-3 py-2 text-text-muted text-sm hover:text-error transition-colors rounded-lg hover:bg-bg-elevated mt-1"
          >
            <app-icon name="log-out" [size]="18"></app-icon> Sign Out
          </button>
        </div>
      </aside>

      <!-- Overlay for mobile -->
      @if (sidebarOpen()) {
        <div
          class="fixed inset-0 bg-black/50 z-40 lg:hidden"
          (click)="closeSidebarMobile()"
        ></div>
      }

      <!-- Main Content -->
      <main class="flex-1 min-h-screen">
        <!-- Top Bar -->
        <header class="sticky top-0 z-30 h-16 bg-bg-primary/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-6">
          <button
            class="lg:hidden text-text-secondary hover:text-text-primary"
            (click)="toggleSidebar()"
          >
            <app-icon name="menu" [size]="24"></app-icon>
          </button>
          <div class="flex items-center gap-3">
            <span class="text-text-muted text-sm">Welcome, Admin</span>
            <div class="w-8 h-8 rounded-full bg-accent-subtle border border-accent-border flex items-center justify-center text-accent text-xs font-semibold">
              A
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <div class="p-6 lg:p-8">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styles: `
    .admin-nav-active {
      color: var(--color-accent) !important;
      background: var(--color-accent-subtle) !important;
      border-right: 2px solid var(--color-accent);
    }
  `,
})
export class AdminLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  sidebarOpen = signal(true);

  navItems = [
    { icon: 'layout-dashboard', label: 'Dashboard', path: '/admin/dashboard', exact: true },
    { icon: 'party', label: 'Services', path: '/admin/services', exact: false },
    { icon: 'camera', label: 'Gallery', path: '/admin/gallery', exact: false },
    { icon: 'image', label: 'Hero Slides', path: '/admin/hero', exact: false },
    { icon: 'plus-circle', label: 'Add-ons', path: '/admin/addons', exact: false },
    { icon: 'book-open', label: 'Flipbook', path: '/admin/flipbook', exact: false },
    { icon: 'star', label: 'Testimonials', path: '/admin/testimonials', exact: false },
    { icon: 'calendar', label: 'Bookings', path: '/admin/bookings', exact: false },
    { icon: 'settings', label: 'Settings', path: '/admin/settings', exact: false },
  ];

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebarMobile(): void {
    if (window.innerWidth < 1024) {
      this.sidebarOpen.set(false);
    }
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
    this.router.navigate(['/admin/login']);
  }
}
