// src/locations/entities/location.entity.ts
import { Business } from 'src/business/entities/business.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
} from 'typeorm';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index('idx_location_name')
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index('idx_location_slug')
  slug: string;

  @Column({ type: 'varchar', length: 100 })
  @Index('idx_location_state')
  state: string;

  @Column({ type: 'varchar', length: 100 })
  @Index('idx_location_country')
  country: string;

  @Column({ type: 'boolean', default: true })
  @Index('idx_location_active')
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Relations
  @OneToMany(() => Business, (business) => business.location)
  businesses: Business[];

  // Geographical coordinates for mapping
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;
}
