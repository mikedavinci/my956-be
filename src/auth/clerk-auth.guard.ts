// src/auth/clerk-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { getAuth } from '@clerk/express';
import { Request } from 'express';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const auth = getAuth(request);

    // Check if user is authenticated
    if (!auth?.userId) {
      throw new UnauthorizedException('Authentication required');
    }

    return true;
  }
}
