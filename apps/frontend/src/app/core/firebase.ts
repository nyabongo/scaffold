import { InjectionToken } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import { environment } from '../../environments/environment';

export const firebaseApp = initializeApp(environment.firebaseConfig);

export const FIREBASE_AUTH = new InjectionToken<Auth>('FIREBASE_AUTH', {
  factory: () => {
    const auth = getAuth(firebaseApp);
    if (environment.useAuthEmulator) {
      connectAuthEmulator(auth, environment.authEmulatorHost, { disableWarnings: true });
    }
    return auth;
  },
});
