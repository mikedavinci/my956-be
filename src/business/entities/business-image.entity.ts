// src/businesses/entities/business-image.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Business } from './business.entity';

@Entity()
export class BusinessImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileName: string;

  @Column()
  fileUrl: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column()
  s3Key: string;

  @Column({ default: false })
  isPrivate: boolean;

  @ManyToOne(() => Business, (business) => business.images)
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column({ type: 'uuid', nullable: true })
  businessId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
