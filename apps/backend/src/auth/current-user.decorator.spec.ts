import { ExecutionContext } from '@nestjs/common';
import { extractCurrentUser } from './current-user.decorator';

describe('extractCurrentUser', () => {
  it('returns the user attached to the request by the auth guard', () => {
    const user = { uid: 'uid-1', email: 'a@b.com' };
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    } as unknown as ExecutionContext;

    expect(extractCurrentUser(undefined, context)).toBe(user);
  });
});
