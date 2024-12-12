// src/auth/clerk.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { clerkClient, clerkMiddleware } from '@clerk/express';

@Injectable()
export class ClerkMiddleware implements NestMiddleware {
  private clerk = clerkMiddleware();

  use(req: Request, res: Response, next: NextFunction) {
    // Use Clerk's official middleware
    this.clerk(req, res, next);
  }
}
