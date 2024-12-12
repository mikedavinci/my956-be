// src/deals/entities/deal.entity.ts
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
  Check,
} from 'typeorm';
import { DealStatus } from '../enums/deal-status.enum';
import { Business } from 'src/business/entities/business.entity';

@Entity('deals')
@Check(`"discountedPrice" < "originalPrice"`)
export class Deal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index('idx_deal_business')
  businessId: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column({ type: 'varchar', length: 255 })
  @Index('idx_deal_title')
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  discount: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  originalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discountedPrice: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index('idx_deal_code')
  code: string;

  @Column({ type: 'timestamp' })
  @Index('idx_deal_start_date')
  startDate: Date;

  @Column({ type: 'timestamp' })
  @Index('idx_deal_end_date')
  endDate: Date;

  @Column({ type: 'jsonb', default: [] })
  terms: string[];

  @Column({ type: 'jsonb', default: [] })
  features: string[];

  @Column({
    type: 'enum',
    enum: DealStatus,
    default: DealStatus.DRAFT,
  })
  @Index('idx_deal_status')
  status: DealStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Metadata
  @Column({ type: 'integer', default: 0 })
  redemptionCount: number;

  @Column({ type: 'integer', nullable: true })
  maxRedemptions: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Virtual properties
  get isExpired(): boolean {
    return new Date() > this.endDate;
  }

  get discountPercentage(): number {
    return (
      ((this.originalPrice - this.discountedPrice) / this.originalPrice) * 100
    );
  }

  get isAvailable(): boolean {
    return (
      !this.isExpired &&
      this.status === DealStatus.ACTIVE &&
      (!this.maxRedemptions || this.redemptionCount < this.maxRedemptions)
    );
  }
}
