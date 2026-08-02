import {
  Component,
  HostListener,
  inject,
  signal,
  PLATFORM_ID,
  OnInit,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      [class.nav-scrolled]="isScrolled()"
      [class.nav-transparent]="!isScrolled()"
    >
      <div class="section-container">
        <div class="flex items-center justify-between h-20">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center group">
            <img src="/images/logo.png" alt="Spark Celebrations Logo" class="h-12 w-auto object-contain" style="max-height: 50px; width: auto;" />
          </a>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center gap-8">
            @for (link of navLinks; track link.path) {
              <a
                [routerLink]="link.path"
                routerLinkActive="nav-link-active"
                [routerLinkActiveOptions]="{ exact: link.path === '/' }"
                class="nav-link text-sm font-medium tracking-wide uppercase"
              >
                {{ link.label }}
              </a>
            }
          </div>

          <!-- CTA + Hamburger -->
          <div class="flex items-center gap-4">
            <!-- Theme Toggle -->
            <button 
              (click)="themeService.toggleTheme()"
              class="w-10 h-10 rounded-full flex items-center justify-center bg-bg-glass hover:bg-bg-glass-hover border border-border-light text-text-primary transition-colors"
              aria-label="Toggle theme"
            >
              @if (themeService.isDarkTheme()) {
                <!-- Sun Icon -->
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              } @else {
                <!-- Moon Icon -->
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              }
            </button>

            <a
              routerLink="/book"
              class="hidden lg:inline-flex btn-primary !py-2.5 !px-5 !text-sm"
            >
              <span>Book Now</span>
            </a>

            <!-- Hamburger -->
            <button
              class="md:hidden flex flex-col gap-1.5 p-2"
              (click)="toggleMenu()"
              [attr.aria-expanded]="menuOpen()"
              aria-label="Toggle menu"
            >
              <span
                class="w-6 h-0.5 bg-text-primary transition-all duration-300"
                [class.rotate-45]="menuOpen()"
                [class.translate-y-2]="menuOpen()"
              ></span>
              <span
                class="w-6 h-0.5 bg-text-primary transition-all duration-300"
                [class.opacity-0]="menuOpen()"
              ></span>
              <span
                class="w-6 h-0.5 bg-text-primary transition-all duration-300"
                [class.-rotate-45]="menuOpen()"
                [class.-translate-y-2]="menuOpen()"
              ></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (menuOpen()) {
        <div class="md:hidden absolute inset-x-0 top-20 bg-bg-surface/95 backdrop-blur-xl border-t border-border">
          <div class="section-container py-6 flex flex-col gap-4">
            @for (link of navLinks; track link.path) {
              <a
                [routerLink]="link.path"
                routerLinkActive="text-accent"
                [routerLinkActiveOptions]="{ exact: link.path === '/' }"
                class="text-lg font-medium py-2 text-text-secondary hover:text-accent transition-colors"
                (click)="closeMenu()"
              >
                {{ link.label }}
              </a>
            }
            <a
              routerLink="/book"
              class="btn-primary mt-4 text-center"
              (click)="closeMenu()"
            >
              <span>Book Now</span>
            </a>
          </div>
        </div>
      }
    </nav>
  `,
  styles: `
    .nav-transparent {
      background: transparent;
    }

    .nav-scrolled {
      background: rgba(6, 6, 8, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .nav-link {
      color: var(--color-text-secondary);
      position: relative;
      transition: color 300ms ease;
    }

    .nav-link:hover,
    .nav-link-active {
      color: var(--color-text-primary);
    }

    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--color-accent);
      transition: width 300ms ease;
      border-radius: 1px;
    }

    .nav-link:hover::after,
    .nav-link-active::after {
      width: 100%;
    }
  `,
})
export class NavbarComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  public themeService = inject(ThemeService);

  isScrolled = signal(false);
  menuOpen = signal(false);

  navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'About', path: '/about' },
    { label: 'Flipbook', path: '/flipbook' },
    { label: 'Contact', path: '/contact' },
  ];

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScroll();
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.checkScroll();
  }

  private checkScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled.set(window.scrollY > 50);
    }
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
