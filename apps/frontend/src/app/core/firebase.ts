import { InjectionToken } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { environment } from '../../environments/environment';

export const firebaseApp = initializeApp(environment.firebaseConfig);

export const FIREBASE_AUTH = new InjectionToken<Auth>('FIREBASE_AUTH', {
  factory: () => getAuth(firebaseApp),
});
