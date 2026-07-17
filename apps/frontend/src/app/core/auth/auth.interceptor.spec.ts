import { HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import type { Auth } from 'firebase/auth';
import { authInterceptor } from './auth.interceptor';
import { FIREBASE_AUTH } from '../firebase';

function configure(currentUser: Auth['currentUser']) {
  TestBed.configureTestingModule({
    providers: [{ provide: FIREBASE_AUTH, useValue: { currentUser } }],
  });
}

describe('authInterceptor', () => {
  const req = new HttpRequest('GET', '/auth/me');

  it('passes the request through unchanged when there is no signed-in user', async () => {
    configure(null);
    const next = vi.fn().mockReturnValue(of('response'));

    await firstValueFrom(TestBed.runInInjectionContext(() => authInterceptor(req, next)));

    expect(next).toHaveBeenCalledWith(req);
  });

  it('attaches an Authorization bearer header when a user is signed in', async () => {
    configure({
      getIdToken: vi.fn().mockResolvedValue('id-token-123'),
    } as unknown as Auth['currentUser']);
    const next = vi.fn().mockReturnValue(of('response'));

    await firstValueFrom(TestBed.runInInjectionContext(() => authInterceptor(req, next)));

    const clonedReq = next.mock.calls[0][0] as HttpRequest<unknown>;
    expect(clonedReq.headers.get('Authorization')).toBe('Bearer id-token-123');
  });
});
