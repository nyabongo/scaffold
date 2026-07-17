import { HttpRequest } from '@angular/common/http';
import { of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { firebaseAuth } from '../firebase';

jest.mock('../firebase', () => ({
  firebaseAuth: { currentUser: null },
}));

describe('authInterceptor', () => {
  const req = new HttpRequest('GET', '/auth/me');

  afterEach(() => {
    (firebaseAuth as { currentUser: unknown }).currentUser = null;
  });

  it('passes the request through unchanged when there is no signed-in user', (done) => {
    const next = jest.fn().mockReturnValue(of('response'));

    authInterceptor(req, next).subscribe(() => {
      expect(next).toHaveBeenCalledWith(req);
      done();
    });
  });

  it('attaches an Authorization bearer header when a user is signed in', (done) => {
    (firebaseAuth as { currentUser: unknown }).currentUser = {
      getIdToken: jest.fn().mockResolvedValue('id-token-123'),
    };
    const next = jest.fn().mockReturnValue(of('response'));

    authInterceptor(req, next).subscribe(() => {
      const clonedReq = next.mock.calls[0][0] as HttpRequest<unknown>;
      expect(clonedReq.headers.get('Authorization')).toBe('Bearer id-token-123');
      done();
    });
  });
});
