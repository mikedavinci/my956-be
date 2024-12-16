// src/clerk/clerk-webhook.controller.ts
import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Webhook } from 'svix';
import { InvitationService } from '../invitation/invitation.service';
import { SessionService } from 'src/session/session.service';
import { UserRole } from '../user/enums/user-role.enums';
import { UserStatus } from '../user/enums/user-status.enum';
import { UsersService } from 'src/user/user.service';

interface WebhookEvent {
  data: Record<string, any>;
  object: string;
  type: string;
}

@Controller('clerk/webhooks')
export class ClerkWebhookController {
  private readonly logger = new Logger(ClerkWebhookController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly invitationService: InvitationService,
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService
  ) {}

  @Post()
  async handleWebhook(
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
    @Body() payload: unknown
  ) {
    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException('Missing webhook headers');
    }

    const webhookSecret = this.configService.get<string>(
      'CLERK_WEBHOOK_SECRET'
    );
    if (!webhookSecret) {
      throw new Error('CLERK_WEBHOOK_SECRET is not configured');
    }

    let evt: WebhookEvent;

    try {
      const wh = new Webhook(webhookSecret);
      evt = wh.verify(JSON.stringify(payload), {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as WebhookEvent;
    } catch (err) {
      this.logger.error('Webhook verification failed:', err);
      throw new BadRequestException('Invalid webhook signature');
    }

    try {
      this.logger.log(`Processing webhook event: ${evt.type}`);

      switch (evt.type) {
        // User events
        case 'user.created':
          await this.handleUserCreated(evt.data);
          break;
        case 'user.updated':
          await this.handleUserUpdated(evt.data);
          break;
        case 'user.deleted':
          await this.handleUserDeleted(evt.data);
          break;

        // Session events
        case 'session.created':
          await this.handleSessionCreated(evt.data);
          break;
        case 'session.ended':
          await this.handleSessionEnded(evt.data);
          break;
        case 'session.revoked':
          await this.handleSessionRevoked(evt.data);
          break;

        // Organization Invitation events
        case 'organizationInvitation.created':
          await this.handleOrgInvitationCreated(evt.data);
          break;
        case 'organizationInvitation.accepted':
          await this.handleOrgInvitationAccepted(evt.data);
          break;
        case 'organizationInvitation.revoked':
          await this.handleOrgInvitationRevoked(evt.data);
          break;

        default:
          this.logger.warn(`Unhandled webhook event type: ${evt.type}`);
      }

      return { success: true, event: evt.type };
    } catch (error) {
      this.logger.error(`Error handling webhook ${evt.type}:`, error);
      throw error;
    }
  }

  // User Event Handlers
  private async handleUserCreated(data: any) {
    try {
      const {
        id: clerkId,
        email_addresses,
        first_name,
        last_name,
        public_metadata,
      } = data;

      const primaryEmail = email_addresses.find(
        (email: any) => email.primary
      )?.email_address;
      if (!primaryEmail) {
        throw new BadRequestException('User must have a primary email');
      }

      await this.usersService.create({
        clerkId,
        email: primaryEmail,
        firstName: first_name || '',
        lastName: last_name || '',
        role: public_metadata?.role || UserRole.USER,
        status: UserStatus.ACTIVE,
      });

      this.logger.log(`Created user for Clerk ID: ${clerkId}`);
    } catch (error) {
      this.logger.error('Failed to handle user creation:', error);
      throw error;
    }
  }

  private async handleUserUpdated(data: any) {
    try {
      const {
        id: clerkId,
        email_addresses,
        first_name,
        last_name,
        public_metadata,
      } = data;

      const primaryEmail = email_addresses.find(
        (email: any) => email.primary
      )?.email_address;
      const user = await this.usersService.findByClerkId(clerkId);

      await this.usersService.updateOne(user.id, {
        email: primaryEmail || user.email,
        firstName: first_name || user.firstName,
        lastName: last_name || user.lastName,
        ...(public_metadata?.role && { role: public_metadata.role }),
      });

      this.logger.log(`Updated user for Clerk ID: ${clerkId}`);
    } catch (error) {
      this.logger.error('Failed to handle user update:', error);
      throw error;
    }
  }

  private async handleUserDeleted(data: any) {
    try {
      const { id: clerkId } = data;
      const user = await this.usersService.findByClerkId(clerkId);
      await this.usersService.softDelete(user.id);
      this.logger.log(`Soft-deleted user for Clerk ID: ${clerkId}`);
    } catch (error) {
      this.logger.error('Failed to handle user deletion:', error);
      throw error;
    }
  }

  // Session Event Handlers
  private async handleSessionCreated(data: any) {
    try {
      const { id: clerkSessionId, user_id: clerkUserId } = data;
      const user = await this.usersService.findByClerkId(clerkUserId);
      await this.sessionService.create({
        clerkSessionId,
        userId: user.id,
        metadata: {},
        status: 'active',
      });
      this.logger.log(`Created session: ${clerkSessionId}`);
    } catch (error) {
      this.logger.error('Failed to handle session creation:', error);
      throw error;
    }
  }

  private async handleSessionEnded(data: any) {
    try {
      const { id: sessionId } = data;
      await this.sessionService.endSession(sessionId);
      this.logger.log(`Ended session: ${sessionId}`);
    } catch (error) {
      this.logger.error('Failed to handle session end:', error);
      throw error;
    }
  }

  private async handleSessionRevoked(data: any) {
    try {
      const { id: sessionId } = data;
      await this.sessionService.revokeSession(sessionId);
      this.logger.log(`Revoked session: ${sessionId}`);
    } catch (error) {
      this.logger.error('Failed to handle session revocation:', error);
      throw error;
    }
  }

  // Organization Invitation Event Handlers
  private async handleOrgInvitationCreated(data: any) {
    try {
      const { id: invitationId, email_address } = data;
      await this.invitationService.create({
        email: email_address,
        businessName: data.public_metadata?.businessName || '',
        phone: data.public_metadata?.phone || '',
        firstName: data.public_metadata?.firstName || '',
        lastName: data.public_metadata?.lastName || '',
      });
      this.logger.log(`Created organization invitation: ${invitationId}`);
    } catch (error) {
      this.logger.error('Failed to handle org invitation creation:', error);
      throw error;
    }
  }

  private async handleOrgInvitationAccepted(data: any) {
    try {
      const { id: invitationId, user_id: clerkUserId } = data;
      const user = await this.usersService.findByClerkId(clerkUserId);
      await this.invitationService.markAsAccepted(invitationId, user.id);
      this.logger.log(`Accepted organization invitation: ${invitationId}`);
    } catch (error) {
      this.logger.error('Failed to handle org invitation acceptance:', error);
      throw error;
    }
  }

  private async handleOrgInvitationRevoked(data: any) {
    try {
      const { id: invitationId } = data;
      await this.invitationService.markAsRevoked(invitationId);
      this.logger.log(`Revoked organization invitation: ${invitationId}`);
    } catch (error) {
      this.logger.error('Failed to handle org invitation revocation:', error);
      throw error;
    }
  }
}
