import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { FIREBASE_ADMIN } from './firebase-admin.provider';

jest.mock('firebase-admin/auth', () => ({ getAuth: jest.fn() }));
jest.mock('firebase-admin/app', () => ({
  getApps: jest.fn().mockReturnValue([]),
  cert: jest.fn(),
  initializeApp: jest.fn(),
}));

describe('AuthController', () => {
  let controller: AuthController;
  let usersService: { findByFirebaseUid: jest.Mock; register: jest.Mock };

  const authUser = { uid: 'uid-1', email: 'a@b.com' };

  beforeEach(async () => {
    usersService = { findByFirebaseUid: jest.fn(), register: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: FIREBASE_ADMIN, useValue: {} },
      ],
    }).compile();

    controller = module.get(AuthController);
  });

  describe('me', () => {
    it('throws NotFoundException when the account has no profile yet', async () => {
      usersService.findByFirebaseUid.mockResolvedValue(null);
      await expect(controller.me(authUser)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns the profile when it exists', async () => {
      usersService.findByFirebaseUid.mockResolvedValue({
        id: '1',
        firebaseUid: 'uid-1',
        username: 'alice',
        displayName: null,
        avatarUrl: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      const result = await controller.me(authUser);
      expect(result).toEqual({
        authenticated: true,
        user: {
          id: '1',
          firebaseUid: 'uid-1',
          username: 'alice',
          displayName: null,
          avatarUrl: null,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      });
    });
  });

  describe('register', () => {
    it('delegates to UsersService.register and maps the result', async () => {
      usersService.register.mockResolvedValue({
        id: '1',
        firebaseUid: 'uid-1',
        username: 'alice',
        displayName: null,
        avatarUrl: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      const result = await controller.register(authUser, { username: 'alice' });
      expect(usersService.register).toHaveBeenCalledWith('uid-1', 'alice');
      expect(result.username).toBe('alice');
    });
  });
});
