import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const status = await authService.waitUntilResolved();
  if (status === 'ready') {
    return true;
  }
  if (status === 'needs-username') {
    return router.createUrlTree(['/onboard']);
  }
  return router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const status = await authService.waitUntilResolved();
  if (status === 'signed-out') {
    return true;
  }
  return router.createUrlTree(status === 'needs-username' ? ['/onboard'] : ['/']);
};

export const onboardingGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const status = await authService.waitUntilResolved();
  if (status === 'needs-username') {
    return true;
  }
  return router.createUrlTree(status === 'ready' ? ['/'] : ['/login']);
};
