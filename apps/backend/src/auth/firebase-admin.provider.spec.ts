import { ConfigService } from '@nestjs/config';
import * as firebaseApp from 'firebase-admin/app';
import { firebaseAdminProvider } from './firebase-admin.provider';

jest.mock('firebase-admin/app', () => ({
  getApps: jest.fn().mockReturnValue([]),
  cert: jest.fn().mockReturnValue('cert'),
  initializeApp: jest.fn().mockReturnValue('app'),
}));

describe('firebaseAdminProvider', () => {
  const factory = firebaseAdminProvider['useFactory'] as (config: ConfigService) => unknown;

  const originalEmulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;

  beforeEach(() => {
    jest.clearAllMocks();
    (firebaseApp.getApps as jest.Mock).mockReturnValue([]);
    delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
  });

  afterEach(() => {
    if (originalEmulatorHost === undefined) {
      delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
    } else {
      process.env.FIREBASE_AUTH_EMULATOR_HOST = originalEmulatorHost;
    }
  });

  function configWith(values: Record<string, string>): ConfigService {
    return {
      getOrThrow: (key: string) => {
        if (!(key in values)) throw new Error(`missing ${key}`);
        return values[key];
      },
    } as unknown as ConfigService;
  }

  it('initializes a new firebase app from config when none exists yet', () => {
    const config = configWith({
      FIREBASE_PROJECT_ID: 'proj',
      FIREBASE_CLIENT_EMAIL: 'svc@proj.iam.gserviceaccount.com',
      FIREBASE_PRIVATE_KEY: 'line1\\nline2',
    });

    const app = factory(config);

    expect(firebaseApp.cert).toHaveBeenCalledWith({
      projectId: 'proj',
      clientEmail: 'svc@proj.iam.gserviceaccount.com',
      privateKey: 'line1\nline2',
    });
    expect(firebaseApp.initializeApp).toHaveBeenCalledWith({ credential: 'cert' });
    expect(app).toBe('app');
  });

  it('initializes without credentials when the auth emulator host is set', () => {
    process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
    const config = configWith({ FIREBASE_PROJECT_ID: 'demo-scaffold' });

    const app = factory(config);

    expect(firebaseApp.cert).not.toHaveBeenCalled();
    expect(firebaseApp.initializeApp).toHaveBeenCalledWith({ projectId: 'demo-scaffold' });
    expect(app).toBe('app');
  });

  it('reuses an already-initialized app instead of creating a second one', () => {
    (firebaseApp.getApps as jest.Mock).mockReturnValue(['existing-app']);
    const config = configWith({});

    const app = factory(config);

    expect(app).toBe('existing-app');
    expect(firebaseApp.initializeApp).not.toHaveBeenCalled();
  });
});
