// src/deals/dto/deal-response.dto.ts
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DealStatus } from '../enums/deal-status.enum';

@Exclude()
export class DealResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  businessId: string;

  @Expose()
  @ApiProperty()
  title: string;

  @Expose()
  @ApiProperty()
  description: string;

  @Expose()
  @ApiProperty()
  discount: string;

  @Expose()
  @ApiProperty()
  originalPrice: number;

  @Expose()
  @ApiProperty()
  discountedPrice: number;

  @Expose()
  @ApiProperty()
  code: string;

  @Expose()
  @ApiProperty()
  startDate: Date;

  @Expose()
  @ApiProperty()
  endDate: Date;

  @Expose()
  @ApiProperty()
  terms: string[];

  @Expose()
  @ApiProperty()
  features: string[];

  @Expose()
  @ApiProperty({ enum: DealStatus })
  status: DealStatus;

  @Expose()
  @ApiProperty()
  redemptionCount: number;

  @Expose()
  @ApiPropertyOptional()
  maxRedemptions?: number;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @ApiProperty()
  isExpired: boolean;

  @Expose()
  @ApiProperty()
  discountPercentage: number;

  @Expose()
  @ApiProperty()
  isAvailable: boolean;

  constructor(partial: Partial<DealResponseDto>) {
    Object.assign(this, partial);
  }
}
