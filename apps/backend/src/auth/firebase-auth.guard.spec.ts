import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FirebaseAuthGuard, RequestWithUser } from './firebase-auth.guard';

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(),
}));

function createContext(headers: Record<string, string>): {
  context: ExecutionContext;
  request: Partial<RequestWithUser>;
} {
  const request: Partial<RequestWithUser> = { headers };
  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
  return { context, request };
}

describe('FirebaseAuthGuard', () => {
  const mockGetAuth = getAuth as jest.Mock;

  beforeEach(() => {
    mockGetAuth.mockReset();
  });

  it('throws when there is no Authorization header', async () => {
    const verifyIdToken = jest.fn();
    mockGetAuth.mockReturnValue({ verifyIdToken });
    const guard = new FirebaseAuthGuard({} as unknown as App);
    const { context } = createContext({});

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('throws when the Bearer token is blank after trimming', async () => {
    const verifyIdToken = jest.fn();
    mockGetAuth.mockReturnValue({ verifyIdToken });
    const guard = new FirebaseAuthGuard({} as unknown as App);
    const { context } = createContext({ authorization: 'Bearer    ' });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('throws when the Authorization header is not a Bearer token', async () => {
    const verifyIdToken = jest.fn();
    mockGetAuth.mockReturnValue({ verifyIdToken });
    const guard = new FirebaseAuthGuard({} as unknown as App);
    const { context } = createContext({ authorization: 'Basic abc123' });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws when the token fails verification', async () => {
    const verifyIdToken = jest.fn().mockRejectedValue(new Error('invalid'));
    mockGetAuth.mockReturnValue({ verifyIdToken });
    const guard = new FirebaseAuthGuard({} as unknown as App);
    const { context } = createContext({ authorization: 'Bearer bad-token' });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('attaches the decoded user and allows the request through on success', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'uid-1', email: 'a@b.com' });
    mockGetAuth.mockReturnValue({ verifyIdToken });
    const guard = new FirebaseAuthGuard({} as unknown as App);
    const { context, request } = createContext({ authorization: 'Bearer good-token' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(verifyIdToken).toHaveBeenCalledWith('good-token');
    expect(request.user).toEqual({ uid: 'uid-1', email: 'a@b.com' });
  });

  it('defaults email to null when Firebase omits it', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: 'uid-1' });
    mockGetAuth.mockReturnValue({ verifyIdToken });
    const guard = new FirebaseAuthGuard({} as unknown as App);
    const { context, request } = createContext({ authorization: 'Bearer good-token' });

    await guard.canActivate(context);
    expect(request.user).toEqual({ uid: 'uid-1', email: null });
  });
});
