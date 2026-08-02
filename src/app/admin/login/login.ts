import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-bg-primary relative overflow-hidden">
      <!-- Background Effects -->
      <div class="absolute inset-0">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px]"></div>
        <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-[100px]"></div>
      </div>

      <!-- Login Card -->
      <div class="relative z-10 w-full max-w-md mx-4">
        <div class="glass p-10 rounded-2xl">
          <!-- Logo -->
          <div class="text-center mb-8">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-accent to-accent-dim flex items-center justify-center mb-4">
              <span class="text-bg-primary font-bold text-2xl font-heading">S</span>
            </div>
            <h1 class="text-2xl font-heading font-semibold">Admin Panel</h1>
            <p class="text-text-secondary text-sm mt-1">Sign in to manage your website</p>
          </div>

          <!-- Error -->
          @if (errorMsg()) {
            <div class="mb-6 p-3 bg-error/10 border border-error/30 rounded-xl text-error text-sm text-center">
              {{ errorMsg() }}
            </div>
          }

          <!-- Form -->
          <form (ngSubmit)="login()" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-border focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
                placeholder="admin@sparkcelebrations.com"
                autocomplete="email"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
              <input
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-border focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
                placeholder="••••••••"
                autocomplete="current-password"
              />
            </div>
            <button
              type="submit"
              class="w-full btn-primary !py-3.5 !rounded-xl !text-base"
              [disabled]="loading()"
            >
              <span>{{ loading() ? 'Signing in...' : 'Sign In' }}</span>
            </button>
          </form>

          <p class="text-center text-text-muted text-xs mt-6">
            Protected area. Authorized administrators only.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class AdminLoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  errorMsg = signal('');

  async login(): Promise<void> {
    if (!this.email || !this.password) {
      this.errorMsg.set('Please fill in all fields');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    const { error } = await this.auth.signIn(this.email, this.password);

    if (error) {
      this.errorMsg.set(error);
      this.loading.set(false);
    } else {
      this.router.navigate(['/admin/dashboard']);
    }
  }
}
