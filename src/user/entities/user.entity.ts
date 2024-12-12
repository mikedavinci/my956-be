// src/users/entities/user.entity.ts
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
import { UserStatus } from '../enums/user-status.enum';
import { UserRole } from '../enums/user-role.enums';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index('idx_user_email', { unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @Index('idx_user_clerk_id', { unique: true })
  clerkId: string;

  @Column({ type: 'varchar', length: 100 })
  @Index('idx_user_first_name')
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  @Index('idx_user_last_name')
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  @Index('idx_user_role')
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  @Index('idx_user_status')
  status: UserStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profileImageUrl: string;

  @CreateDateColumn()
  @Index('idx_user_created_at')
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: true })
  notificationsEnabled: boolean;

  // Virtual property for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Relations will be added as we implement other entities
  // @OneToMany(() => Business, business => business.user)
  // businesses: Business[];
}
