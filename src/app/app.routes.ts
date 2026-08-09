// app routes
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ── Public Routes ──────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./layouts/public-layout/public-layout').then((m) => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./public/home/home').then((m) => m.HomeComponent),
        title: 'Spark Celebrations | Premium Party Theatre',
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./public/services/services').then((m) => m.ServicesComponent),
        title: 'Our Services | Spark Celebrations',
      },
      {
        path: 'services/:id',
        loadComponent: () =>
          import('./public/service-detail/service-detail').then((m) => m.ServiceDetailComponent),
        title: 'Service Detail | Spark Celebrations',
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./public/events/events').then((m) => m.EventsComponent),
        title: 'Events | Spark Celebrations',
      },
      {
        path: 'gallery',
        loadComponent: () =>
          import('./public/gallery/gallery').then((m) => m.GalleryComponent),
        title: 'Gallery | Spark Celebrations',
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./public/about/about').then((m) => m.AboutComponent),
        title: 'About Us | Spark Celebrations',
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./public/contact/contact').then((m) => m.ContactComponent),
        title: 'Contact Us | Spark Celebrations',
      },
      {
        path: 'flipbook',
        loadComponent: () =>
          import('./public/flipbook/flipbook').then((m) => m.FlipbookComponent),
        title: 'Flipbook | Spark Celebrations',
      },
    ],
  },

  // ── Admin Routes (Lazy Loaded) ─────────────
  {
    path: 'admin',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./admin/login/login').then((m) => m.AdminLoginComponent),
        title: 'Admin Login | Spark Celebrations',
      },
      {
        path: '',
        loadComponent: () =>
          import('./admin/layout/admin-layout').then((m) => m.AdminLayoutComponent),
        canActivate: [authGuard],
        children: [
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full',
          },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./admin/dashboard/dashboard').then((m) => m.DashboardComponent),
            title: 'Dashboard | Admin',
          },
          {
            path: 'services',
            loadComponent: () =>
              import('./admin/services-mgmt/services-mgmt').then((m) => m.ServicesMgmtComponent),
            title: 'Services | Admin',
          },
          {
            path: 'gallery',
            loadComponent: () =>
              import('./admin/gallery-mgmt/gallery-mgmt').then((m) => m.GalleryMgmtComponent),
            title: 'Gallery | Admin',
          },
          {
            path: 'hero',
            loadComponent: () =>
              import('./admin/hero-mgmt/hero-mgmt').then((m) => m.HeroMgmtComponent),
            title: 'Hero Section | Admin',
          },
          {
            path: 'addons',
            loadComponent: () =>
              import('./admin/addons-mgmt/addons-mgmt').then((m) => m.AddonsMgmtComponent),
            title: 'Add-ons | Admin',
          },
          {
            path: 'flipbook',
            loadComponent: () =>
              import('./admin/flipbook-mgmt/flipbook-mgmt').then((m) => m.FlipbookMgmtComponent),
            title: 'Flipbook | Admin',
          },
          {
            path: 'testimonials',
            loadComponent: () =>
              import('./admin/testimonials-mgmt/testimonials-mgmt').then(
                (m) => m.TestimonialsMgmtComponent
              ),
            title: 'Testimonials | Admin',
          },
          {
            path: 'bookings',
            loadComponent: () =>
              import('./admin/bookings-mgmt/bookings-mgmt').then((m) => m.BookingsMgmtComponent),
            title: 'Bookings | Admin',
          },
          {
            path: 'settings',
            loadComponent: () =>
              import('./admin/settings/settings').then((m) => m.SettingsComponent),
            title: 'Settings | Admin',
          },
        ],
      },
    ],
  },

  // ── Wildcard ───────────────────────────────
  { path: '**', redirectTo: '' },
];
