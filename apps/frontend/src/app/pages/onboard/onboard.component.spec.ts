import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import type { Mock } from 'vitest';
import { AuthService } from '../../core/auth/auth.service';
import { OnboardComponent } from './onboard.component';

describe('OnboardComponent', () => {
  let authService: { registerUsername: Mock };

  beforeEach(async () => {
    authService = { registerUsername: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [OnboardComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();
  });

  it('does not submit an invalid username', async () => {
    const fixture = TestBed.createComponent(OnboardComponent);
    const component = fixture.componentInstance;
    component.usernameControl.setValue('a');

    await component.submit();

    expect(authService.registerUsername).not.toHaveBeenCalled();
    expect(component.usernameControl.touched).toBe(true);
  });

  it('registers a valid username and navigates to the new profile', async () => {
    authService.registerUsername.mockResolvedValue({ username: 'alice' });
    const fixture = TestBed.createComponent(OnboardComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.usernameControl.setValue('alice');

    await component.submit();

    expect(authService.registerUsername).toHaveBeenCalledWith('alice');
    expect(navigateSpy).toHaveBeenCalledWith(['/@alice']);
  });

  it('shows a conflict message when the username is taken', async () => {
    authService.registerUsername.mockRejectedValue({ status: 409 });
    const fixture = TestBed.createComponent(OnboardComponent);
    const component = fixture.componentInstance;
    component.usernameControl.setValue('alice');

    await component.submit();

    expect(component.errorMessage()).toBe('That username is already taken.');
  });

  it('shows a validation message on a 400 response', async () => {
    authService.registerUsername.mockRejectedValue({ status: 400 });
    const fixture = TestBed.createComponent(OnboardComponent);
    const component = fixture.componentInstance;
    component.usernameControl.setValue('alice');

    await component.submit();

    expect(component.errorMessage()).toBe('Please choose a valid username.');
  });

  it('shows a generic message for other errors', async () => {
    authService.registerUsername.mockRejectedValue(new Error('boom'));
    const fixture = TestBed.createComponent(OnboardComponent);
    const component = fixture.componentInstance;
    component.usernameControl.setValue('alice');

    await component.submit();

    expect(component.errorMessage()).toBe('Something went wrong. Please try again.');
  });
});
