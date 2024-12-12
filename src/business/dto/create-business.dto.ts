// src/businesses/dto/create-business.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsEmail,
  IsUrl,
  IsUUID,
  IsBoolean,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { BusinessStatus } from '../enums/business-status.enum';

export class CreateBusinessDto {
  @ApiProperty({ example: 'Awesome Business Name' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'awesome-business-name' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase, numbers, and hyphens only',
  })
  slug: string;

  @ApiProperty({ example: 'Detailed business description' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: 'Restaurant' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'contact@business.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format',
  })
  phone: string;

  @ApiProperty({ example: '123 Business Street, City, Country' })
  @IsString()
  @MinLength(5)
  address: string;

  @ApiPropertyOptional({ example: 'https://www.business.com' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ example: 'https://example.com/profile.jpg' })
  @IsUrl()
  profileImage: string;

  @ApiPropertyOptional({ enum: BusinessStatus })
  @IsOptional()
  @IsEnum(BusinessStatus)
  status?: BusinessStatus;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  locationId: string;
}
