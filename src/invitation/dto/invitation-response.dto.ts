// src/invitation/dto/invitation-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Invitation } from '../entities/invitation.entity';

export class InvitationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  businessName: string;

  @ApiProperty()
  clerkInvitationId: string;

  @ApiProperty()
  status: string;

  constructor(invitation: Invitation) {
    this.id = invitation.id;
    this.email = invitation.email;
    this.businessName = invitation.businessName;
    this.clerkInvitationId = invitation.clerkInvitationId;
    this.status = invitation.status;
  }
}
