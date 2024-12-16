// src/users/dto/user-response.dto.ts
import { Exclude, Expose } from 'class-transformer';
import { UserRole } from '../enums/user-role.enums';
import { UserStatus } from '../enums/user-status.enum';
import { IsOptional } from 'class-validator';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  clerkId: string;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  role: UserRole;

  @Expose()
  status: UserStatus;

  @Expose()
  @IsOptional()
  profileImageUrl: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
