import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AcceptInvitationDto {
  @ApiProperty({
    description: 'The Clerk user ID of the person accepting the invitation',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'The invitation ticket from Clerk',
  })
  @IsNotEmpty()
  @IsString()
  ticket: string;
}
