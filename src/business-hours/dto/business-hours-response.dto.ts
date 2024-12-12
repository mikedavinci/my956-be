// src/business-hours/dto/business-hours-response.dto.ts
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DayOfWeek } from '../days-of-week.enum';

@Exclude()
export class BusinessHoursResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  businessId: string;

  @Expose()
  @ApiProperty({ enum: DayOfWeek })
  dayOfWeek: DayOfWeek;

  @Expose()
  @ApiProperty()
  openTime: string;

  @Expose()
  @ApiProperty()
  closeTime: string;

  @Expose()
  @ApiProperty()
  isClosed: boolean;

  @Expose()
  @ApiProperty()
  isHoliday: boolean;

  @Expose()
  @ApiPropertyOptional()
  note?: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<BusinessHoursResponseDto>) {
    Object.assign(this, partial);
  }
}
