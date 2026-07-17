import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import * as firebaseAuthModule from 'firebase/auth';
import { ApiService } from '../api.service';
import { AuthService } from './auth.service';

let idTokenCallback: ((user: unknown) => void) | null = null;

jest.mock('../firebase', () => ({
  firebaseAuth: {},
}));

jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: jest.fn(),
  onIdTokenChanged: jest.fn((_auth: unknown, cb: (user: unknown) => void) => {
    idTokenCallback = cb;
    return () => {};
  }),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
}));

describe('AuthService', () => {
  let api: { me: jest.Mock; register: jest.Mock };

  beforeEach(() => {
    idTokenCallback = null;
    api = { me: jest.fn(), register: jest.fn() };

    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: api }],
    });
  });

  it('starts in the loading status', () => {
    const service = TestBed.inject(AuthService);
    expect(service.status()).toBe('loading');
  });

  it('resolves to signed-out when Firebase reports no user', async () => {
    const service = TestBed.inject(AuthService);
    idTokenCallback?.(null);

    await expect(service.waitUntilResolved()).resolves.toBe('signed-out');
    expect(service.status()).toBe('signed-out');
    expect(service.isAuthenticated()).toBe(false);
  });

  it('resolves to ready and stores the profile when /auth/me succeeds', async () => {
    api.me.mockReturnValue(of({ authenticated: true, user: { username: 'alice' } }));
    const service = TestBed.inject(AuthService);

    idTokenCallback?.({ uid: 'uid-1' });
    await service.waitUntilResolved();

    expect(service.status()).toBe('ready');
    expect(service.profile()?.username).toBe('alice');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('resolves to needs-username when /auth/me 404s', async () => {
    api.me.mockReturnValue(throwError(() => ({ status: 404 })));
    const service = TestBed.inject(AuthService);

    idTokenCallback?.({ uid: 'uid-1' });
    await service.waitUntilResolved();

    expect(service.status()).toBe('needs-username');
    expect(service.profile()).toBeNull();
  });

  it('resolves to signed-out when /auth/me fails for a non-404 reason', async () => {
    api.me.mockReturnValue(throwError(() => ({ status: 500 })));
    const service = TestBed.inject(AuthService);

    idTokenCallback?.({ uid: 'uid-1' });
    await service.waitUntilResolved();

    expect(service.status()).toBe('signed-out');
  });

  it('registerUsername stores the new profile and flips status to ready', async () => {
    api.register.mockReturnValue(of({ username: 'alice' }));
    const service = TestBed.inject(AuthService);

    const profile = await service.registerUsername('alice');

    expect(profile.username).toBe('alice');
    expect(service.profile()?.username).toBe('alice');
    expect(service.status()).toBe('ready');
  });

  it('signInWithGoogle delegates to firebase/auth signInWithPopup', async () => {
    const service = TestBed.inject(AuthService);
    await service.signInWithGoogle();
    expect(firebaseAuthModule.signInWithPopup).toHaveBeenCalled();
  });

  it('signOutUser delegates to firebase/auth signOut', async () => {
    const service = TestBed.inject(AuthService);
    await service.signOutUser();
    expect(firebaseAuthModule.signOut).toHaveBeenCalled();
  });
});
