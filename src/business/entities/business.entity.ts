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
  OneToMany,
} from 'typeorm';
import { BusinessStatus } from '../enums/business-status.enum';
import { User } from 'src/user/entities/user.entity';
import { BusinessImage } from './business-image.entity';
import { Location } from 'src/location/entities/location.entity';
import { LocationEnum } from 'src/location/enums/location.enum';

@Entity('businesses')
@Index(['name', 'locationId'], { unique: true })
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index('idx_business_name')
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  @Index('idx_business_slug')
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  @Index('idx_business_category')
  category: string;

  @Column({ type: 'varchar', length: 100 })
  contactFirstName: string;

  @Column({ type: 'varchar', length: 100 })
  contactLastName: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  phone: string;

  // @Column({ type: 'text' })
  // address: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  website?: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  profileImageUrl?: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  profileImageId?: string;

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
  @ManyToOne(() => User, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  @Index('idx_business_user_id')
  user: User;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => Location, (location) => location.businesses)
  @JoinColumn({ name: 'locationId' })
  location: Location;

  @Column({
    type: 'enum',
    enum: LocationEnum,
    enumName: 'location_enum', // Use the same enumName
  })
  @Index('idx_business_location_id')
  locationId: LocationEnum;

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

  @Column({ type: 'varchar', length: 1024, nullable: true })
  facebookUrl?: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  xUrl?: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  instagramUrl?: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  linkedinUrl?: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  qrCodeUrl: string;

  @OneToMany(() => BusinessImage, (image) => image.business)
  images: BusinessImage[];

  @CreateDateColumn()
  qrCodeGeneratedAt: Date;
}
