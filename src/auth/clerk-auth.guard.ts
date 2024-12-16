import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getAuth } from '@clerk/express';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler()
    );
    if (isPublic) {
      return true; // Skip authentication for public routes
    }

    const request = context.switchToHttp().getRequest<Request>();
    const auth = getAuth(request);

    if (!auth?.userId) {
      throw new UnauthorizedException('Authentication required');
    }

    return true;
  }
}
