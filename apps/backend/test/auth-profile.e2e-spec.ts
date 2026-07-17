import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { FirebaseAuthGuard } from '../src/auth/firebase-auth.guard';
import { PrismaService } from '../src/prisma/prisma.service';

jest.mock('firebase-admin/auth', () => ({ getAuth: jest.fn() }));
jest.mock('firebase-admin/app', () => ({
  getApps: jest.fn().mockReturnValue([]),
  cert: jest.fn(),
  initializeApp: jest.fn(),
}));

const AUTH_UID = 'e2e-test-uid';

class MockFirebaseAuthGuard {
  canActivate(context: import('@nestjs/common').ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    request.user = { uid: AUTH_UID, email: 'e2e@example.com' };
    return true;
  }
}

describe('Auth + Profiles (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useClass(MockFirebaseAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { firebaseUid: AUTH_UID } });
    await app.close();
  });

  it('GET /auth/me returns 404 before the account has a username', () => {
    return request(app.getHttpServer()).get('/auth/me').expect(404);
  });

  it('GET /profiles/:username returns 404 for an unknown username', () => {
    return request(app.getHttpServer()).get('/profiles/nobody-e2e').expect(404);
  });

  it('POST /auth/register rejects an invalid username', () => {
    return request(app.getHttpServer()).post('/auth/register').send({ username: 'a' }).expect(400);
  });

  it('POST /auth/register creates the account, then GET /auth/me and /profiles/:username reflect it', async () => {
    const username = `e2euser_${Date.now()}`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username })
      .expect(201)
      .expect((res) => {
        expect(res.body.username).toBe(username);
      });

    await request(app.getHttpServer())
      .get('/auth/me')
      .expect(200)
      .expect((res) => {
        expect(res.body.user.username).toBe(username);
      });

    await request(app.getHttpServer())
      .get(`/profiles/${username}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.username).toBe(username);
        expect(res.body).not.toHaveProperty('firebaseUid');
      });

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: `${username}_second` })
      .expect(409);
  });
});
