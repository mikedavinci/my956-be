// src/social-media/dto/social-media-response.dto.ts
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SocialMediaPlatform } from '../enums/social-media-platform.enum';

@Exclude()
export class SocialMediaResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  businessId: string;

  @Expose()
  @ApiProperty({ enum: SocialMediaPlatform })
  platform: SocialMediaPlatform;

  @Expose()
  @ApiProperty()
  url: string;

  @Expose()
  @ApiPropertyOptional()
  username?: string;

  @Expose()
  @ApiProperty()
  isActive: boolean;

  @Expose()
  @ApiProperty()
  followers: number;

  @Expose()
  @ApiPropertyOptional()
  lastSynced?: Date;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<SocialMediaResponseDto>) {
    Object.assign(this, partial);
  }
}
