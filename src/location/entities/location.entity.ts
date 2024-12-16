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
  PrimaryColumn,
} from 'typeorm';
import { LocationEnum } from '../enums/location.enum';

@Entity('locations')
export class Location {
  @PrimaryColumn({
    type: 'enum',
    enum: LocationEnum,
    enumName: 'location_enum',
  })
  id: LocationEnum;

  @Column()
  name: string;

  @Column()
  state: string;

  @Column()
  country: string;

  @OneToMany(() => Business, (business) => business.location)
  businesses: Business[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
