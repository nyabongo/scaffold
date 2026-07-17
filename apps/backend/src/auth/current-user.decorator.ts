import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestWithUser } from './firebase-auth.guard';

export function extractCurrentUser(_: unknown, ctx: ExecutionContext) {
  const request = ctx.switchToHttp().getRequest<RequestWithUser>();
  return request.user;
}

export const CurrentUser = createParamDecorator(extractCurrentUser);
