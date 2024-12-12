// src/notifications/dto/update-notification.dto.ts
import { PartialType, OmitType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateNotificationDto } from './create-notification.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationDto extends PartialType(
  OmitType(CreateNotificationDto, ['userId', 'type'] as const)
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
