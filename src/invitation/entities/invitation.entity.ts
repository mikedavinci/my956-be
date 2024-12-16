// src/invitation/entities/invitation.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Business } from '../../business/entities/business.entity';
import { InvitationStatus } from '../enums/invitation-status.enum';

@Entity('invitations')
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index('idx_invitation_email')
  email: string;

  @Column({ type: 'varchar', length: 255 })
  businessName: string;

  @Column({ type: 'varchar', length: 50 })
  phone: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index('idx_invitation_clerk_id')
  clerkInvitationId: string;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  @Index('idx_invitation_status')
  status: InvitationStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'acceptedByUserId' })
  acceptedByUser: User;

  @Column({ type: 'uuid', nullable: true })
  acceptedByUserId: string;

  @ManyToOne(() => Business, { nullable: true })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column({ type: 'uuid', nullable: true })
  businessId: string;
}
