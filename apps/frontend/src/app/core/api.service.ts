import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { AuthMeResponse, PublicProfile, UserProfile } from '@scaffold/shared-types';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  me() {
    return this.http.get<AuthMeResponse>(`${this.baseUrl}/auth/me`);
  }

  register(username: string) {
    return this.http.post<UserProfile>(`${this.baseUrl}/auth/register`, { username });
  }

  getProfileByUsername(username: string) {
    return this.http.get<PublicProfile>(`${this.baseUrl}/profiles/${username}`);
  }
}
