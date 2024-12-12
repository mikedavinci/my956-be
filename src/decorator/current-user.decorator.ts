// src/auth/decorators/current-user.decorator.ts
import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { getAuth, clerkClient } from '@clerk/express';

export const CurrentUser = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const auth = getAuth(request);

    if (!auth?.userId) {
      throw new UnauthorizedException('Authentication required');
    }

    // Get full user details from Clerk if needed
    const user = await clerkClient.users.getUser(auth.userId);
    return user;
  },
);
