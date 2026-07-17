import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';

export const FIREBASE_ADMIN = 'FIREBASE_ADMIN';

export const firebaseAdminProvider: Provider = {
  provide: FIREBASE_ADMIN,
  inject: [ConfigService],
  useFactory: (config: ConfigService): App => {
    const existing = getApps();
    if (existing.length > 0) {
      return existing[0];
    }

    return initializeApp({
      credential: cert({
        projectId: config.getOrThrow<string>('FIREBASE_PROJECT_ID'),
        clientEmail: config.getOrThrow<string>('FIREBASE_CLIENT_EMAIL'),
        privateKey: config.getOrThrow<string>('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
      }),
    });
  },
};
