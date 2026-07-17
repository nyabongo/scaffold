export interface UserProfile {
  id: string;
  firebaseUid: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface PublicProfile {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface RegisterUsernameRequest {
  username: string;
}

export interface AuthMeResponse {
  authenticated: true;
  user: UserProfile;
}

export const USERNAME_PATTERN = /^[a-z0-9_](?!.*__)[a-z0-9_]{1,30}[a-z0-9_]$/i;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 32;
