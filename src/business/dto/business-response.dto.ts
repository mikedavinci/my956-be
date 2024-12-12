// src/businesses/dto/business-response.dto.ts
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BusinessStatus } from '../enums/business-status.enum';
import { UserResponseDto } from 'src/user/dto/user-response.dto';

@Exclude()
export class BusinessResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  slug: string;

  @Expose()
  @ApiProperty()
  description: string;

  @Expose()
  @ApiProperty()
  category: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  phone: string;

  @Expose()
  @ApiProperty()
  address: string;

  @Expose()
  @ApiPropertyOptional()
  website?: string;

  @Expose()
  @ApiProperty()
  profileImage: string;

  @Expose()
  @ApiProperty()
  rating: number;

  @Expose()
  @ApiProperty()
  reviewCount: number;

  @Expose()
  @ApiProperty({ enum: BusinessStatus })
  status: BusinessStatus;

  @Expose()
  @ApiProperty()
  featured: boolean;

  @Expose()
  @ApiProperty()
  qrCodeUrl: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @Type(() => UserResponseDto)
  @ApiProperty({ type: () => UserResponseDto })
  user: UserResponseDto;

  constructor(partial: Partial<BusinessResponseDto>) {
    Object.assign(this, partial);
  }
}
