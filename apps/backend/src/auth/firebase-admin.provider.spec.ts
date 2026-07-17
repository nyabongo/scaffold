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

  beforeEach(() => {
    jest.clearAllMocks();
    (firebaseApp.getApps as jest.Mock).mockReturnValue([]);
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

  it('reuses an already-initialized app instead of creating a second one', () => {
    (firebaseApp.getApps as jest.Mock).mockReturnValue(['existing-app']);
    const config = configWith({});

    const app = factory(config);

    expect(app).toBe('existing-app');
    expect(firebaseApp.initializeApp).not.toHaveBeenCalled();
  });
});
