// src/subscriptions/dto/subscription-response.dto.ts
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BusinessResponseDto } from 'src/business/dto/business-response.dto';
import { SubscriptionPlan } from '../enums/subscription-plan.enum';
import { SubscriptionStatus } from '../enums/subscription-status.enum';

@Exclude()
export class SubscriptionResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  businessId: string;

  @Expose()
  @Type(() => BusinessResponseDto)
  @ApiProperty({ type: () => BusinessResponseDto })
  business: BusinessResponseDto;

  @Expose()
  @ApiProperty({ enum: SubscriptionPlan })
  plan: SubscriptionPlan;

  @Expose()
  @ApiProperty()
  startDate: Date;

  @Expose()
  @ApiProperty()
  endDate: Date;

  @Expose()
  @ApiProperty({ enum: SubscriptionStatus })
  status: SubscriptionStatus;

  @Expose()
  @ApiProperty()
  price: number;

  @Expose()
  @ApiProperty()
  isActive: boolean;

  @Expose()
  @ApiProperty()
  daysRemaining: number;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<SubscriptionResponseDto>) {
    Object.assign(this, partial);
  }
}
