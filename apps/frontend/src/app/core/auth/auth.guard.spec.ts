import { TestBed } from '@angular/core/testing';
import { provideRouter, UrlTree } from '@angular/router';
import { authGuard, guestGuard, onboardingGuard } from './auth.guard';
import { AuthService } from './auth.service';
import type { AuthStatus } from './auth.service';

function configure(status: AuthStatus) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: AuthService, useValue: { waitUntilResolved: () => Promise.resolve(status) } },
    ],
  });
}

describe('authGuard', () => {
  it('allows navigation when ready', async () => {
    configure('ready');
    const result = await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('redirects to /onboard when needs-username', async () => {
    configure('needs-username');
    const result = await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect((result as UrlTree).toString()).toBe('/onboard');
  });

  it('redirects to /login when signed-out', async () => {
    configure('signed-out');
    const result = await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect((result as UrlTree).toString()).toBe('/login');
  });
});

describe('guestGuard', () => {
  it('allows navigation when signed-out', async () => {
    configure('signed-out');
    const result = await TestBed.runInInjectionContext(() => guestGuard({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('redirects to /onboard when needs-username', async () => {
    configure('needs-username');
    const result = await TestBed.runInInjectionContext(() => guestGuard({} as any, {} as any));
    expect((result as UrlTree).toString()).toBe('/onboard');
  });

  it('redirects to / when ready', async () => {
    configure('ready');
    const result = await TestBed.runInInjectionContext(() => guestGuard({} as any, {} as any));
    expect((result as UrlTree).toString()).toBe('/');
  });
});

describe('onboardingGuard', () => {
  it('allows navigation when needs-username', async () => {
    configure('needs-username');
    const result = await TestBed.runInInjectionContext(() => onboardingGuard({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('redirects to / when ready', async () => {
    configure('ready');
    const result = await TestBed.runInInjectionContext(() => onboardingGuard({} as any, {} as any));
    expect((result as UrlTree).toString()).toBe('/');
  });

  it('redirects to /login when signed-out', async () => {
    configure('signed-out');
    const result = await TestBed.runInInjectionContext(() => onboardingGuard({} as any, {} as any));
    expect((result as UrlTree).toString()).toBe('/login');
  });
});
