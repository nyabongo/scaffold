import { Injectable, computed, inject, signal } from '@angular/core';
import type { UserProfile } from '@scaffold/shared-types';
import {
  GoogleAuthProvider,
  onIdTokenChanged,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../api.service';
import { FIREBASE_AUTH } from '../firebase';

export type AuthStatus = 'loading' | 'signed-out' | 'needs-username' | 'ready';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(FIREBASE_AUTH);

  private readonly firebaseUserSignal = signal<FirebaseUser | null>(null);
  private readonly profileSignal = signal<UserProfile | null>(null);
  private readonly statusSignal = signal<AuthStatus>('loading');

  readonly firebaseUser = this.firebaseUserSignal.asReadonly();
  readonly profile = this.profileSignal.asReadonly();
  readonly status = this.statusSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.firebaseUserSignal() !== null);

  private resolveInitialAuth!: (status: AuthStatus) => void;
  private readonly initialAuthResolved = new Promise<AuthStatus>((resolve) => {
    this.resolveInitialAuth = resolve;
  });

  constructor() {
    onIdTokenChanged(this.auth, (user) => {
      this.firebaseUserSignal.set(user);
      if (user) {
        void this.refreshProfile();
      } else {
        this.profileSignal.set(null);
        this.statusSignal.set('signed-out');
        this.resolveInitialAuth('signed-out');
      }
    });
  }

  waitUntilResolved(): Promise<AuthStatus> {
    return this.initialAuthResolved;
  }

  async signInWithGoogle(): Promise<void> {
    await signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  async signOutUser(): Promise<void> {
    await signOut(this.auth);
  }

  async refreshProfile(): Promise<void> {
    this.statusSignal.set('loading');
    try {
      const response = await firstValueFrom(this.api.me());
      this.profileSignal.set(response.user);
      this.statusSignal.set('ready');
    } catch (error: unknown) {
      this.profileSignal.set(null);
      this.statusSignal.set(this.isNotFound(error) ? 'needs-username' : 'signed-out');
    } finally {
      this.resolveInitialAuth(this.statusSignal());
    }
  }

  async registerUsername(username: string): Promise<UserProfile> {
    const profile = await firstValueFrom(this.api.register(username));
    this.profileSignal.set(profile);
    this.statusSignal.set('ready');
    return profile;
  }

  private isNotFound(error: unknown): boolean {
    return (
      typeof error === 'object' && error !== null && (error as { status?: number }).status === 404
    );
  }
}
