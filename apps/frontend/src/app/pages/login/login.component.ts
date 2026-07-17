import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);

  readonly isSigningIn = signal(false);
  readonly errorMessage = signal<string | null>(null);

  async signInWithGoogle(): Promise<void> {
    this.errorMessage.set(null);
    this.isSigningIn.set(true);
    try {
      await this.authService.signInWithGoogle();
    } catch {
      this.errorMessage.set('Sign-in failed. Please try again.');
    } finally {
      this.isSigningIn.set(false);
    }
  }
}
