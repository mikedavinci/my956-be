// src/clerk/clerk.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InvitationModule } from '../invitation/invitation.module';
import { UserModule } from '../user/user.module';
import { ClerkWebhookController } from './clerk.controller';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [ConfigModule, InvitationModule, UserModule, SessionModule],
  controllers: [ClerkWebhookController],
  providers: [],
})
export class ClerkModule {}
