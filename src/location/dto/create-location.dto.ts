// src/locations/dto/create-location.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  MinLength,
  MaxLength,
  IsNumber,
  IsLatitude,
  IsLongitude,
  Matches,
} from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({ example: 'New York City' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'new-york-city' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase, numbers, and hyphens only',
  })
  slug: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  state: string;

  @ApiProperty({ example: 'United States' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  country: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 40.7128 })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({ example: -74.006 })
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}
