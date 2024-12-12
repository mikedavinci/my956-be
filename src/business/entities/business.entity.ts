// src/businesses/entities/business.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { BusinessStatus } from '../enums/business-status.enum';
import { User } from 'src/user/entities/user.entity';
import { Location } from 'src/location/entities/location.entity';

@Entity('businesses')
@Index(['name', 'locationId'], { unique: true })
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index('idx_business_name')
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index('idx_business_slug')
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  @Index('idx_business_category')
  category: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  phone: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website?: string;

  @Column({ type: 'varchar', length: 255 })
  profileImage: string;

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  @Check(`"rating" >= 0 AND "rating" <= 5`)
  rating: number;

  @Column({ type: 'integer', default: 0 })
  reviewCount: number;

  @Column({
    type: 'enum',
    enum: BusinessStatus,
    default: BusinessStatus.PENDING,
  })
  @Index('idx_business_status')
  status: BusinessStatus;

  @Column({ type: 'boolean', default: false })
  @Index('idx_business_featured')
  featured: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations
  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  @Index('idx_business_user_id')
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Location, (location) => location.businesses)
  @JoinColumn({ name: 'locationId' })
  location: Location;

  @Column({ type: 'uuid' })
  @Index('idx_business_location_id')
  locationId: string;

  // Metadata columns
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  lastVerifiedAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  verifiedBy: string;

  // Virtual properties
  get isVerified(): boolean {
    return !!this.lastVerifiedAt;
  }

  get averageRating(): number {
    return this.reviewCount > 0 ? Number(this.rating) : 0;
  }

  @Column({ type: 'varchar', length: 255, nullable: true })
  qrCodeUrl: string;

  @CreateDateColumn()
  qrCodeGeneratedAt: Date;
}
