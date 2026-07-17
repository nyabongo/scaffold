import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { AuthService } from '../../core/auth/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let authService: { signInWithGoogle: Mock };

  beforeEach(async () => {
    authService = { signInWithGoogle: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compileComponents();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('signs in with Google and clears the signing-in flag', async () => {
    authService.signInWithGoogle.mockResolvedValue(undefined);
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    await component.signInWithGoogle();

    expect(authService.signInWithGoogle).toHaveBeenCalled();
    expect(component.isSigningIn()).toBe(false);
    expect(component.errorMessage()).toBeNull();
  });

  it('sets an error message when sign-in fails', async () => {
    authService.signInWithGoogle.mockRejectedValue(new Error('nope'));
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    await component.signInWithGoogle();

    expect(component.errorMessage()).toBe('Sign-in failed. Please try again.');
    expect(component.isSigningIn()).toBe(false);
  });
});
