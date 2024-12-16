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
  IsNotEmpty,
} from 'class-validator';
import { BusinessStatus } from '../enums/business-status.enum';
import { LocationEnum } from 'src/location/enums/location.enum';

export class CreateBusinessDto {
  @ApiProperty({ example: 'Awesome Business Name' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  slug?: string;

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

  @ApiProperty({ enum: LocationEnum, enumName: 'location_enum' })
  @IsEnum(LocationEnum)
  locationId: LocationEnum;

  @ApiPropertyOptional({ example: 'https://www.business.com' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ example: 'https://example.com/profile.jpg' })
  @ApiPropertyOptional()
  @IsString()
  profileImageUrl?: string;

  @ApiProperty({ example: '123' })
  @IsString()
  @ApiPropertyOptional()
  profileImageId?: string;

  @ApiPropertyOptional({ enum: BusinessStatus })
  @IsOptional()
  @IsEnum(BusinessStatus)
  status?: BusinessStatus;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ example: 'https://facebook.com/business-name' })
  @IsOptional()
  @IsUrl()
  facebookUrl?: string;

  @ApiPropertyOptional({ example: 'https://x.com/business-name' })
  @IsOptional()
  @IsUrl()
  xUrl?: string;

  @ApiPropertyOptional({ example: 'https://instagram.com/business-name' })
  @IsOptional()
  @IsUrl()
  instagramUrl?: string;

  @ApiPropertyOptional({
    example: 'https://linkedin.com/company/business-name',
  })
  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clerkInvitationId: string;

  // Add contact info from invitation
  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(2)
  contactFirstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(2)
  contactLastName: string;
}
