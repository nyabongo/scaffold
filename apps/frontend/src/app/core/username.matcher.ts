import { UrlMatchResult, UrlSegment, UrlSegmentGroup, Route } from '@angular/router';

export function usernameMatcher(
  segments: UrlSegment[],
  _group: UrlSegmentGroup,
  _route: Route,
): UrlMatchResult | null {
  if (segments.length === 1 && segments[0].path.startsWith('@') && segments[0].path.length > 1) {
    return {
      consumed: segments,
      posParams: {
        username: new UrlSegment(segments[0].path.slice(1), {}),
      },
    };
  }
  return null;
}
