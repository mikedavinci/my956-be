// src/subscriptions/dto/update-subscription.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateSubscriptionDto } from './create-subscription.dto';
import { SubscriptionStatus } from '../enums/subscription-status.enum';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSubscriptionDto extends PartialType(CreateSubscriptionDto) {
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  @ApiPropertyOptional({ enum: SubscriptionStatus })
  status?: SubscriptionStatus;
}
