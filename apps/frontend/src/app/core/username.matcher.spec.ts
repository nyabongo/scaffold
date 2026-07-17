import { UrlSegment } from '@angular/router';
import { usernameMatcher } from './username.matcher';

describe('usernameMatcher', () => {
  it('matches a single @username segment', () => {
    const result = usernameMatcher([new UrlSegment('@alice', {})], {} as any, {} as any);
    expect(result).not.toBeNull();
    expect(result?.posParams?.['username'].path).toBe('alice');
  });

  it('rejects a bare @ with no username', () => {
    const result = usernameMatcher([new UrlSegment('@', {})], {} as any, {} as any);
    expect(result).toBeNull();
  });

  it('rejects segments that do not start with @', () => {
    const result = usernameMatcher([new UrlSegment('settings', {})], {} as any, {} as any);
    expect(result).toBeNull();
  });

  it('rejects more than one segment', () => {
    const result = usernameMatcher(
      [new UrlSegment('@alice', {}), new UrlSegment('extra', {})],
      {} as any,
      {} as any,
    );
    expect(result).toBeNull();
  });
});
