import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  it('redirects to the current user profile', () => {
    const authService = { profile: () => ({ username: 'alice' }) };

    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    });
    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    TestBed.createComponent(HomeComponent);

    expect(navigateSpy).toHaveBeenCalledWith(['/@alice']);
  });
});
