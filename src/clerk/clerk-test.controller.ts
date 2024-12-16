// Create a test endpoint
// src/clerk/clerk-test.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { SessionService } from '../session/session.service';
import { CurrentUser } from 'src/decorator/current-user.decorator';
import { Public } from 'src/auth/public.decorator';

@Controller('test-clerk')
export class ClerkTestController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('session')
  @Public()
  @UseGuards(ClerkAuthGuard)
  async testSession(@CurrentUser() user: any) {
    const sessions = await this.sessionService.getUserActiveSessions(user.id);
    return {
      user,
      activeSessions: sessions,
    };
  }
}
