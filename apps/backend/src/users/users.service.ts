import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, type User } from '@prisma/client';

const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { firebaseUid } });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { username: { equals: username, mode: 'insensitive' } },
    });
  }

  async isUsernameTaken(username: string): Promise<boolean> {
    const existing = await this.findByUsername(username);
    return existing !== null;
  }

  async register(firebaseUid: string, username: string): Promise<User> {
    if (await this.findByFirebaseUid(firebaseUid)) {
      throw new ConflictException('This account already has a username');
    }

    if (await this.isUsernameTaken(username)) {
      throw new ConflictException('Username is already taken');
    }

    try {
      return await this.prisma.user.create({
        data: { firebaseUid, username },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_CONSTRAINT_VIOLATION
      ) {
        throw new ConflictException('Username is already taken');
      }
      throw error;
    }
  }
}
