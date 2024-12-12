// src/social-media/entities/social-media.entity.ts
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
  Unique,
} from 'typeorm';
import { SocialMediaPlatform } from '../enums/social-media-platform.enum';
import { Business } from 'src/business/entities/business.entity';

@Entity('social_media')
@Unique(['businessId', 'platform'])
export class SocialMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index('idx_social_media_business')
  businessId: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column({
    type: 'enum',
    enum: SocialMediaPlatform,
  })
  @Index('idx_social_media_platform')
  platform: SocialMediaPlatform;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  username: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Metadata for analytics
  @Column({ type: 'integer', default: 0 })
  followers: number;

  @Column({ type: 'timestamp', nullable: true })
  lastSynced: Date;
}
