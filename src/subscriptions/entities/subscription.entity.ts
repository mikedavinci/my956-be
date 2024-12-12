// src/subscriptions/entities/subscription.entity.ts
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
import { SubscriptionPlan } from '../enums/subscription-plan.enum';
import { SubscriptionStatus } from '../enums/subscription-status.enum';
import { Business } from 'src/business/entities/business.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index('idx_subscription_business')
  businessId: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.FREE,
  })
  @Index('idx_subscription_plan')
  plan: SubscriptionPlan;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
  })
  @Index('idx_subscription_status')
  status: SubscriptionStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @Check(`"price" >= 0`)
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Payment tracking
  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeCustomerId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeSubscriptionId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Virtual properties
  get isActive(): boolean {
    return (
      this.status === SubscriptionStatus.ACTIVE && this.endDate > new Date()
    );
  }

  get daysRemaining(): number {
    if (!this.isActive) return 0;
    const now = new Date();
    return Math.ceil(
      (this.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
  }
}
