// src/invitation/invitation.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { Invitation } from './entities/invitation.entity';
import { User } from '../user/entities/user.entity';
import { Business } from '../business/entities/business.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invitation, User, Business]),
    HttpModule,
    UserModule,
  ],
  controllers: [InvitationController],
  providers: [InvitationService],
  exports: [InvitationService],
})
export class InvitationModule {}
