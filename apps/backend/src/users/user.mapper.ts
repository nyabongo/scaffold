import type { User } from '@prisma/client';
import type { PublicProfile, UserProfile } from '@scaffold/shared-types';

export function toUserProfile(user: User): UserProfile {
  return {
    id: user.id,
    firebaseUid: user.firebaseUid,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
  };
}

export function toPublicProfile(user: User): PublicProfile {
  return {
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
  };
}
