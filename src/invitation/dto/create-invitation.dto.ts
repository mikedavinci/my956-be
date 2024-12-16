// src/invitation/dto/create-invitation.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  MinLength,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateInvitationDto {
  @ApiProperty({ example: 'business@example.com' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'Business Name' })
  @IsNotEmpty()
  @IsString({ message: 'Business name must be a string' })
  @MinLength(2, { message: 'Business name must be at least 2 characters long' })
  businessName: string;

  @ApiProperty({ example: '+12223334444' })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString({ message: 'First name must be a string' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @IsString({ message: 'Last name must be a string' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  lastName: string;
}
