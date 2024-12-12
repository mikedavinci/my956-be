// src/social-media/dto/update-social-media.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateSocialMediaDto } from './create-socialmedia.dto';

export class UpdateSocialMediaDto extends PartialType(
  OmitType(CreateSocialMediaDto, ['businessId', 'platform'] as const)
) {}
