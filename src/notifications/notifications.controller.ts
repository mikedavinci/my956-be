// src/notifications/notifications.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

import { NotificationResponseDto } from './dto/notification-response.dto';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { CurrentUser } from 'src/decorator/current-user.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all notifications for the current user.',
    type: [NotificationResponseDto],
  })
  async findUserNotifications(
    @CurrentUser() user: any
  ): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationsService.findByUser(user.id);
    return notifications.map(
      (notification) => new NotificationResponseDto(notification)
    );
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the count of unread notifications.',
    type: Number,
  })
  async getUnreadCount(@CurrentUser() user: any): Promise<{ count: number }> {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification has been marked as read.',
    type: NotificationResponseDto,
  })
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationsService.markAsRead(id);
    return new NotificationResponseDto(notification);
  }

  @Post('read/all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All notifications have been marked as read.',
  })
  async markAllAsRead(@CurrentUser() user: any): Promise<void> {
    await this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Notification has been successfully deleted.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.notificationsService.remove(id);
  }
}
