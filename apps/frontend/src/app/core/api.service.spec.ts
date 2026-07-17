import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('me() GETs /auth/me', () => {
    service.me().subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/me`);
    expect(req.request.method).toBe('GET');
    req.flush({ authenticated: true, user: {} });
  });

  it('register() POSTs the username to /auth/register', () => {
    service.register('alice').subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'alice' });
    req.flush({});
  });

  it('getProfileByUsername() GETs /profiles/:username', () => {
    service.getProfileByUsername('alice').subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/profiles/alice`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});
