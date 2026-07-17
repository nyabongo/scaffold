import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { ApiService } from '../../core/api.service';
import { ProfileComponent } from './profile.component';

function setup(api: { getProfileByUsername: Mock }, username: string) {
  return TestBed.configureTestingModule({
    imports: [ProfileComponent],
    providers: [
      { provide: ApiService, useValue: api },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap({ username }) } },
      },
    ],
  }).compileComponents();
}

describe('ProfileComponent', () => {
  it('shows the profile when found', async () => {
    const api = {
      getProfileByUsername: vi
        .fn()
        .mockReturnValue(
          of({ username: 'alice', displayName: 'Alice', avatarUrl: null, createdAt: '2026-01-01' }),
        ),
    };
    await setup(api, 'alice');
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(api.getProfileByUsername).toHaveBeenCalledWith('alice');
    expect(fixture.componentInstance.profile()?.username).toBe('alice');
    expect(fixture.componentInstance.notFound()).toBe(false);
  });

  it('sets notFound when the backend returns an error', async () => {
    const api = {
      getProfileByUsername: vi.fn().mockReturnValue(throwError(() => ({ status: 404 }))),
    };
    await setup(api, 'ghost');
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.notFound()).toBe(true);
    expect(fixture.componentInstance.profile()).toBeNull();
  });
});
