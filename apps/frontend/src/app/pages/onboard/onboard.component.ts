import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH, USERNAME_PATTERN } from '@scaffold/shared-types';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-onboard',
  imports: [ReactiveFormsModule],
  templateUrl: './onboard.component.html',
  styleUrl: './onboard.component.scss',
})
export class OnboardComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly usernameControl = new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.minLength(USERNAME_MIN_LENGTH),
      Validators.maxLength(USERNAME_MAX_LENGTH),
      Validators.pattern(USERNAME_PATTERN),
    ],
  });

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly minLength = USERNAME_MIN_LENGTH;
  readonly maxLength = USERNAME_MAX_LENGTH;

  async submit(): Promise<void> {
    if (this.usernameControl.invalid) {
      this.usernameControl.markAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);
    try {
      const profile = await this.authService.registerUsername(this.usernameControl.value);
      await this.router.navigate(['/@' + profile.username]);
    } catch (error: unknown) {
      this.errorMessage.set(this.messageFor(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private messageFor(error: unknown): string {
    const status = (error as { status?: number } | null)?.status;
    if (status === 409) {
      return 'That username is already taken.';
    }
    if (status === 400) {
      return 'Please choose a valid username.';
    }
    return 'Something went wrong. Please try again.';
  }
}
