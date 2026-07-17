import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  template: `<p>Redirecting...</p>`,
})
export class HomeComponent {
  constructor() {
    const authService = inject(AuthService);
    const router = inject(Router);
    const profile = authService.profile();
    if (profile) {
      void router.navigate(['/@' + profile.username]);
    }
  }
}
