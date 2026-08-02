import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  // Wait for auth to initialize before redirecting
  if (auth.loading()) {
    return new Promise<boolean>((resolve) => {
      const check = setInterval(() => {
        if (!auth.loading()) {
          clearInterval(check);
          if (auth.isAuthenticated()) {
            resolve(true);
          } else {
            router.navigate(['/admin/login']);
            resolve(false);
          }
        }
      }, 100);
    });
  }

  router.navigate(['/admin/login']);
  return false;
};
