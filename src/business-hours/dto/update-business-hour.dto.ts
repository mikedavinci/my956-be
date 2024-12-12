// src/business-hours/dto/update-business-hours.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateBusinessHoursDto } from './create-business-hour.dto';

export class UpdateBusinessHoursDto extends PartialType(
  OmitType(CreateBusinessHoursDto, ['businessId', 'dayOfWeek'] as const)
) {}
