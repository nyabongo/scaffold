import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { PublicProfile } from '@scaffold/shared-types';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);

  readonly username = this.route.snapshot.paramMap.get('username') ?? '';
  readonly profile = signal<PublicProfile | null>(null);
  readonly notFound = signal(false);
  readonly loading = signal(true);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      const profile = await firstValueFrom(this.api.getProfileByUsername(this.username));
      this.profile.set(profile);
    } catch {
      this.notFound.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
