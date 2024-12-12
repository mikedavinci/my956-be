// src/businesses/dto/update-business.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateBusinessDto } from './create-business.dto';

export class UpdateBusinessDto extends PartialType(
  OmitType(CreateBusinessDto, ['slug'] as const)
) {}
