// src/locations/dto/update-location.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateLocationDto } from './create-location.dto';

export class UpdateLocationDto extends PartialType(
  OmitType(CreateLocationDto, ['slug'] as const)
) {}
