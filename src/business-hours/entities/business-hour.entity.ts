// src/business-hours/entities/business-hours.entity.ts
import { Business } from 'src/business/entities/business.entity';
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
  Check,
} from 'typeorm';
import { DayOfWeek } from '../days-of-week.enum';

@Entity('business_hours')
@Unique(['businessId', 'dayOfWeek'])
@Check(`"openTime" < "closeTime"`)
export class BusinessHours {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index('idx_business_hours_business')
  businessId: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column({
    type: 'enum',
    enum: DayOfWeek,
  })
  @Index('idx_business_hours_day')
  dayOfWeek: DayOfWeek;

  @Column({ type: 'time' })
  openTime: string;

  @Column({ type: 'time' })
  closeTime: string;

  @Column({ type: 'boolean', default: false })
  isClosed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Additional metadata
  @Column({ type: 'boolean', default: false })
  isHoliday: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  note: string;
}
