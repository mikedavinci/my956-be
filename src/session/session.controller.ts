// src/session/session.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Query,
  HttpStatus,
  ParseUUIDPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SessionService } from './session.service';
import { SessionResponseDto } from './dto/session-response.dto';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../decorator/roles.decorator';
import { UserRole } from '../user/enums/user-role.enums';
import { CurrentUser } from '../decorator/current-user.decorator';
import { SessionStatus } from './entities/session.entity';
import { Public } from 'src/auth/public.decorator';

@ApiTags('sessions')
// @ApiBearerAuth()
// @UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('current')
  @Public()
  @ApiOperation({ summary: 'Get current user session' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the current session.',
    type: SessionResponseDto,
  })
  async getCurrentSession(
    @CurrentUser() user: any
  ): Promise<SessionResponseDto> {
    const session = await this.sessionService.findByClerkId(user.sessionId);
    return new SessionResponseDto(session);
  }

  @Get('user/:userId')
  @Public()
  // @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all sessions for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({
    name: 'status',
    enum: SessionStatus,
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all sessions for the user.',
    type: [SessionResponseDto],
  })
  async getUserSessions(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('status') status?: SessionStatus
  ): Promise<SessionResponseDto[]> {
    const sessions = status
      ? await this.sessionService.getUserSessionsByStatus(userId, status)
      : await this.sessionService.getUserAllSessions(userId);
    return sessions.map((session) => new SessionResponseDto(session));
  }

  @Get('active')
  @Public()
  // @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all active sessions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all active sessions.',
    type: [SessionResponseDto],
  })
  async getActiveSessions(): Promise<SessionResponseDto[]> {
    const sessions = await this.sessionService.getAllActiveSessions();
    return sessions.map((session) => new SessionResponseDto(session));
  }

  @Post(':sessionId/end')
  @Public()
  @ApiOperation({ summary: 'End a specific session' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session has been ended.',
    type: SessionResponseDto,
  })
  async endSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: any
  ): Promise<SessionResponseDto> {
    const session = await this.sessionService.endSession(sessionId);
    return new SessionResponseDto(session);
  }

  @Post(':sessionId/revoke')
  @Public()
  // @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session has been revoked.',
    type: SessionResponseDto,
  })
  async revokeSession(
    @Param('sessionId') sessionId: string
  ): Promise<SessionResponseDto> {
    const session = await this.sessionService.revokeSession(sessionId);
    return new SessionResponseDto(session);
  }

  @Delete('user/:userId/all')
  @Public()
  // @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Revoke all sessions for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'All user sessions have been revoked.',
  })
  async revokeAllUserSessions(
    @Param('userId', ParseUUIDPipe) userId: string
  ): Promise<void> {
    await this.sessionService.revokeAllUserSessions(userId);
  }

  @Get('stats')
  @Public()
  // @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get session statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns session statistics.',
  })
  async getSessionStats() {
    return this.sessionService.getSessionStats();
  }

  @Get(':sessionId')
  @Public()
  @ApiOperation({ summary: 'Get session by ID' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the session.',
    type: SessionResponseDto,
  })
  async getSession(
    @Param('sessionId') sessionId: string
  ): Promise<SessionResponseDto> {
    const session = await this.sessionService.findByClerkId(sessionId);
    return new SessionResponseDto(session);
  }
}
