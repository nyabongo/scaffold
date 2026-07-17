import { Routes } from '@angular/router';
import { authGuard, guestGuard, onboardingGuard } from './core/auth/auth.guard';
import { usernameMatcher } from './core/username.matcher';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { OnboardComponent } from './pages/onboard/onboard.component';
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'onboard', component: OnboardComponent, canActivate: [onboardingGuard] },
  { matcher: usernameMatcher, component: ProfileComponent },
  { path: '**', redirectTo: 'login' },
];
