import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { ProfilesController } from './profiles.controller';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let usersService: { findByUsername: jest.Mock };

  beforeEach(async () => {
    usersService = { findByUsername: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get(ProfilesController);
  });

  it('throws NotFoundException when no user matches the username', async () => {
    usersService.findByUsername.mockResolvedValue(null);
    await expect(controller.getByUsername('ghost')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns only the public fields for a matching user', async () => {
    usersService.findByUsername.mockResolvedValue({
      id: '1',
      firebaseUid: 'uid-1',
      username: 'alice',
      displayName: 'Alice',
      avatarUrl: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const result = await controller.getByUsername('alice');
    expect(result).toEqual({
      username: 'alice',
      displayName: 'Alice',
      avatarUrl: null,
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    expect(result).not.toHaveProperty('firebaseUid');
  });
});
