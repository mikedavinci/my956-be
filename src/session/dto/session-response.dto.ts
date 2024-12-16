// src/session/dto/session-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Session } from '../entities/session.entity';

export class SessionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clerkSessionId: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  endedAt?: Date;

  @ApiProperty({ required: false })
  lastActivityAt?: Date;

  constructor(session: Session) {
    this.id = session.id;
    this.clerkSessionId = session.clerkSessionId;
    this.status = session.status;
    this.userId = session.userId;
    this.createdAt = session.createdAt;
    this.endedAt = session.endedAt;
    this.lastActivityAt = session.lastActivityAt;
  }
}
