// src/deals/dto/create-deal.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsUUID,
  IsArray,
  IsOptional,
  IsDate,
  Min,
  MinLength,
  MaxLength,
  ArrayMinSize,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DealStatus } from '../enums/deal-status.enum';

export class CreateDealDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  businessId: string;

  @ApiProperty({ example: 'Summer Special Discount' })
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Get 20% off on all services this summer' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: '20% OFF' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  discount: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  originalPrice: number;

  @ApiProperty({ example: 80 })
  @IsNumber()
  @Min(0)
  discountedPrice: number;

  @ApiProperty({ example: 'SUMMER20' })
  @IsString()
  @Matches(/^[A-Z0-9-_]+$/, {
    message:
      'Code must contain only uppercase letters, numbers, hyphens, and underscores',
  })
  code: string;

  @ApiProperty({ example: '2024-01-01' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ example: '2024-12-31' })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiProperty({
    example: [
      'Valid for new customers only',
      'Cannot be combined with other offers',
    ],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  terms: string[];

  @ApiProperty({ example: ['Free consultation', '24/7 support'] })
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiPropertyOptional({ enum: DealStatus })
  @IsOptional()
  @IsEnum(DealStatus)
  status?: DealStatus;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxRedemptions?: number;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}
