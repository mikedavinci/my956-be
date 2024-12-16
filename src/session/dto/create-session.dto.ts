// src/session/dto/create-session.dto.ts
import { IsString, IsUUID, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty()
  @IsString()
  clerkSessionId: string;

  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty()
  @IsString()
  status: string;
}
