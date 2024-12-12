// src/subscriptions/dto/create-subscription.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsUUID,
  IsNumber,
  IsOptional,
  IsDate,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionPlan } from '../enums/subscription-plan.enum';

export class CreateSubscriptionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  businessId: string;

  @ApiProperty({ enum: SubscriptionPlan })
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: '2024-01-01' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ example: '2025-01-01' })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}
