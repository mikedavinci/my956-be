// src/session/entities/session.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum SessionStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  REVOKED = 'revoked',
}

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  @Index('idx_session_clerk_id')
  clerkSessionId: string;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
  })
  @Index('idx_session_status')
  status: SessionStatus;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  @Index('idx_session_user_id')
  userId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastActivityAt: Date;

  @Column({ type: 'varchar', nullable: true })
  userAgent: string;

  @Column({ type: 'inet', nullable: true })
  ipAddress: string;
}
