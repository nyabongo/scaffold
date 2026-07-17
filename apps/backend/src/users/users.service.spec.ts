import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(UsersService);
  });

  it('findByFirebaseUid delegates to prisma.user.findUnique', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await service.findByFirebaseUid('uid-1');
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { firebaseUid: 'uid-1' } });
  });

  it('findByUsername does a case-insensitive lookup', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    await service.findByUsername('Alice');
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { username: { equals: 'Alice', mode: 'insensitive' } },
    });
  });

  it('isUsernameTaken returns true when a user is found', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: '1' });
    await expect(service.isUsernameTaken('alice')).resolves.toBe(true);
  });

  it('isUsernameTaken returns false when no user is found', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(service.isUsernameTaken('alice')).resolves.toBe(false);
  });

  it('register throws when the account already has a username', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: '1', username: 'existing' });

    await expect(service.register('uid-1', 'newname')).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('register throws when the username is already taken', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.findFirst.mockResolvedValue({ id: '2', username: 'alice' });

    await expect(service.register('uid-1', 'alice')).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('register creates a user when the username is free', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.findFirst.mockResolvedValue(null);
    const created = { id: '3', firebaseUid: 'uid-1', username: 'alice' };
    prisma.user.create.mockResolvedValue(created);

    await expect(service.register('uid-1', 'alice')).resolves.toEqual(created);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: { firebaseUid: 'uid-1', username: 'alice' },
    });
  });

  it('register converts a race-condition unique-constraint error into a ConflictException', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(service.register('uid-1', 'alice')).rejects.toBeInstanceOf(ConflictException);
  });

  it('register rethrows unrelated errors', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.findFirst.mockResolvedValue(null);
    const unrelated = new Error('boom');
    prisma.user.create.mockRejectedValue(unrelated);

    await expect(service.register('uid-1', 'alice')).rejects.toBe(unrelated);
  });
});
