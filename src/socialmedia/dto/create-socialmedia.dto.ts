// src/social-media/dto/create-social-media.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsUrl,
  IsUUID,
  IsOptional,
  IsBoolean,
  Matches,
} from 'class-validator';
import { SocialMediaPlatform } from '../enums/social-media-platform.enum';

export class CreateSocialMediaDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  businessId: string;

  @ApiProperty({ enum: SocialMediaPlatform })
  @IsEnum(SocialMediaPlatform)
  platform: SocialMediaPlatform;

  @ApiProperty({ example: 'https://facebook.com/businesspage' })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ example: 'businesshandle' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'Username can only contain letters, numbers, dots, underscores, and hyphens',
  })
  username?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
