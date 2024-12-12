// src/business-hours/dto/create-business-hours.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsUUID,
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import { DayOfWeek } from '../days-of-week.enum';

export class CreateBusinessHoursDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  businessId: string;

  @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.MONDAY })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({ example: '09:00' })
  @ValidateIf((o) => !o.isClosed)
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Open time must be in HH:mm format',
  })
  openTime: string;

  @ApiProperty({ example: '17:00' })
  @ValidateIf((o) => !o.isClosed)
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Close time must be in HH:mm format',
  })
  closeTime: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isHoliday?: boolean;

  @ApiPropertyOptional({ example: 'Early closing for special event' })
  @IsOptional()
  @IsString()
  note?: string;
}
