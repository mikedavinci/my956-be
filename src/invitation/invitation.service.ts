// src/invitation/invitation.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Invitation } from './entities/invitation.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { InvitationStatus } from './enums/invitation-status.enum';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import * as jwt from 'jsonwebtoken';
import { Business } from 'src/business/entities/business.entity';
import { User } from 'src/user/entities/user.entity';
import { UsersService } from 'src/user/user.service';
import { UserRole } from 'src/user/enums/user-role.enums';
import { UserStatus } from 'src/user/enums/user-status.enum';
import { BusinessStatus } from 'src/business/enums/business-status.enum';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private userService: UsersService,
    private configService: ConfigService,
    private httpService: HttpService,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>
  ) {}

  async create(createInvitationDto: CreateInvitationDto): Promise<Invitation> {
    try {
      // Existing check for pending invitation
      const existingInvitation = await this.invitationRepository.findOne({
        where: {
          email: createInvitationDto.email,
          status: InvitationStatus.PENDING,
        },
      });

      if (existingInvitation) {
        throw new ConflictException({
          status: 'error',
          message: 'A pending invitation already exists for this email',
        });
      }

      // Create Clerk invitation
      const clerkInvitation =
        await this.createClerkInvitation(createInvitationDto);

      const invitation = this.invitationRepository.create({
        email: createInvitationDto.email,
        businessName: createInvitationDto.businessName,
        phone: createInvitationDto.phone,
        clerkInvitationId: clerkInvitation.id,
        status: InvitationStatus.PENDING,
      });

      const savedInvitation = await this.invitationRepository.save(invitation);
      return savedInvitation;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException({
        status: 'error',
        message: 'Failed to create invitation: ' + error.message,
      });
    }
  }

  private async createClerkInvitation(dto: CreateInvitationDto) {
    const clerkSecretKey = this.configService.get<string>('CLERK_SECRET_KEY');
    if (!clerkSecretKey) {
      throw new Error('CLERK_SECRET_KEY is not configured');
    }

    try {
      console.log('Sending request to Clerk API:', {
        email_address: dto.email,
        public_metadata: {
          businessName: dto.businessName,
          role: 'business_owner',
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
        redirect_url: `${this.configService.get('FRONTEND_URL')}/accept-invitation`,
      });

      const { data } = await firstValueFrom(
        this.httpService
          .post(
            'https://api.clerk.com/v1/invitations',
            {
              email_address: dto.email,
              public_metadata: {
                businessName: dto.businessName,
                role: 'business_owner',
                firstName: dto.firstName,
                lastName: dto.lastName,
              },
              redirect_url: `${this.configService.get('FRONTEND_URL')}/accept-invitation`,
            },
            {
              headers: {
                Authorization: `Bearer ${clerkSecretKey}`,
                'Content-Type': 'application/json',
              },
            }
          )
          .pipe(
            catchError((error: AxiosError) => {
              console.error('Clerk API Error:', {
                status: error.response?.status,
                data: error.response?.data,
                headers: error.response?.headers,
              });
              throw new BadRequestException(
                error.response?.data || 'Failed to create Clerk invitation'
              );
            })
          )
      );

      console.log('Clerk API Response:', data);
      return data;
    } catch (error) {
      console.error('Full error object:', error);
      throw new BadRequestException(
        'Failed to create invitation: ' + error.message
      );
    }
  }

  async findAll(filters: { status?: InvitationStatus; email?: string }) {
    const query = this.invitationRepository.createQueryBuilder('invitation');

    if (filters.status) {
      query.andWhere('invitation.status = :status', { status: filters.status });
    }

    if (filters.email) {
      query.andWhere('invitation.email ILIKE :email', {
        email: `%${filters.email}%`,
      });
    }

    return query.orderBy('invitation.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { id },
    });

    if (!invitation) {
      throw new NotFoundException(`Invitation with ID ${id} not found`);
    }

    return invitation;
  }

  async findByClerkId(clerkInvitationId: string): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { clerkInvitationId },
    });

    if (!invitation) {
      throw new NotFoundException(
        `Invitation with Clerk ID ${clerkInvitationId} not found`
      );
    }

    return invitation;
  }

  async verifyToken(token: string): Promise<Invitation> {
    const clerkSecretKey = this.configService.get<string>('CLERK_SECRET_KEY');

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`https://api.clerk.com/v1/invitations/${token}`, {
          headers: {
            Authorization: `Bearer ${clerkSecretKey}`,
          },
        })
      );

      return this.findByClerkId(data.id);
    } catch (error) {
      throw new BadRequestException('Invalid or expired invitation token');
    }
  }

  async resend(id: string): Promise<Invitation> {
    const invitation = await this.findOne(id);

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Only pending invitations can be resent');
    }

    const clerkSecretKey = this.configService.get<string>('CLERK_SECRET_KEY');

    try {
      await firstValueFrom(
        this.httpService.post(
          `https://api.clerk.com/v1/invitations/${invitation.clerkInvitationId}/revoke`,
          {},
          {
            headers: {
              Authorization: `Bearer ${clerkSecretKey}`,
            },
          }
        )
      );

      // Create new Clerk invitation
      const newClerkInvitation = await this.createClerkInvitation({
        email: invitation.email,
        businessName: invitation.businessName,
        phone: invitation.phone,
        firstName: '',
        lastName: '',
      });

      // Update invitation with new Clerk ID
      invitation.clerkInvitationId = newClerkInvitation.id;
      return this.invitationRepository.save(invitation);
    } catch (error) {
      throw new BadRequestException('Failed to resend invitation');
    }
  }

  async cancel(id: string): Promise<Invitation> {
    const invitation = await this.findOne(id);

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(
        'Only pending invitations can be cancelled'
      );
    }

    const clerkSecretKey = this.configService.get<string>('CLERK_SECRET_KEY');

    try {
      await firstValueFrom(
        this.httpService.post(
          `https://api.clerk.com/v1/invitations/${invitation.clerkInvitationId}/revoke`,
          {},
          {
            headers: {
              Authorization: `Bearer ${clerkSecretKey}`,
            },
          }
        )
      );

      invitation.status = InvitationStatus.REVOKED;
      return this.invitationRepository.save(invitation);
    } catch (error) {
      throw new BadRequestException('Failed to cancel invitation');
    }
  }

  async markAsAccepted(
    invitationId: string,
    userId: string
  ): Promise<Invitation> {
    const invitation = await this.findByClerkId(invitationId);

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Invitation is not pending');
    }

    invitation.status = InvitationStatus.ACCEPTED;
    invitation.acceptedAt = new Date();
    invitation.acceptedByUserId = userId;

    return this.invitationRepository.save(invitation);
  }

  async markAsRevoked(invitationId: string): Promise<Invitation> {
    const invitation = await this.findByClerkId(invitationId);

    if (invitation.status === InvitationStatus.REVOKED) {
      throw new BadRequestException('Invitation is already revoked');
    }

    invitation.status = InvitationStatus.REVOKED;
    return this.invitationRepository.save(invitation);
  }

  async save(invitation: Invitation): Promise<Invitation> {
    return this.invitationRepository.save(invitation);
  }

  async acceptInvitation(
    clerkUserId: string,
    ticket: string
  ): Promise<Invitation> {
    try {
      return await this.invitationRepository.manager.transaction(
        async (transactionalEntityManager) => {
          console.log(
            'Starting invitation acceptance for clerk user:',
            clerkUserId
          );

          // Verify the ticket and get invitation data
          const clerkInvitation = await this.verifyClerkTicket(ticket);
          console.log('Verified invitation data:', clerkInvitation);

          // Find the invitation
          const invitation = await transactionalEntityManager.findOne(
            Invitation,
            {
              where: { clerkInvitationId: clerkInvitation.id },
              relations: ['business'],
            }
          );

          if (!invitation) {
            throw new NotFoundException('Invitation not found');
          }

          // Find or create user
          let user = await transactionalEntityManager.findOne(User, {
            where: { clerkId: clerkUserId },
          });

          if (!user) {
            // Find the associated business to get contact info
            const business = await transactionalEntityManager.findOne(
              Business,
              {
                where: { id: invitation.businessId },
              }
            );

            // Create new user
            user = await transactionalEntityManager.save(User, {
              clerkId: clerkUserId,
              email: invitation.email,
              firstName: business?.contactFirstName || invitation.businessName,
              lastName: business?.contactLastName || '',
              role: UserRole.BUSINESS_OWNER,
              status: UserStatus.ACTIVE,
            });
          }

          // Update invitation
          invitation.status = InvitationStatus.ACCEPTED;
          invitation.acceptedAt = new Date();
          invitation.acceptedByUserId = user.id;

          const updatedInvitation = await transactionalEntityManager.save(
            Invitation,
            invitation
          );

          // Update business
          if (invitation.businessId) {
            const business = await transactionalEntityManager.findOne(
              Business,
              {
                where: { id: invitation.businessId },
              }
            );

            await transactionalEntityManager.update(
              Business,
              { id: invitation.businessId },
              {
                userId: user.id,
                status: BusinessStatus.ACTIVE,
                contactFirstName:
                  business?.contactFirstName || invitation.businessName,
                contactLastName: business?.contactLastName || '',
              }
            );
          }

          return updatedInvitation;
        }
      );
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  private async verifyClerkTicket(ticket: string) {
    const clerkSecretKey = this.configService.get<string>('CLERK_SECRET_KEY');
    if (!clerkSecretKey) {
      throw new Error('CLERK_SECRET_KEY is not configured');
    }

    try {
      // Decode the JWT to get the invitation ID
      const decoded = jwt.decode(ticket) as any;
      console.log('Decoded ticket:', decoded);

      // Try different possible invitation ID fields
      const invitationId = decoded?.sid || decoded?.iid;
      if (!invitationId) {
        throw new BadRequestException('Invalid ticket format');
      }

      // Try to find the invitation directly in our database first
      const invitation = await this.invitationRepository.findOne({
        where: {
          clerkInvitationId: invitationId,
          status: InvitationStatus.PENDING,
        },
        relations: ['business'],
      });

      if (invitation) {
        console.log('Found valid pending invitation in database:', invitation);
        // Return a structure that matches what we expect from Clerk
        return {
          id: invitationId,
          email_address: invitation.email,
          status: invitation.status,
          public_metadata: {
            businessName: invitation.businessName,
          },
        };
      }

      // If we can't find it in our database, then the invitation is invalid
      throw new BadRequestException('Invalid invitation status or not found');
    } catch (error) {
      console.error('Error verifying ticket:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Invalid or expired invitation ticket');
    }
  }

  private async getClerkUserData(clerkUserId: string) {
    const clerkSecretKey = this.configService.get<string>('CLERK_SECRET_KEY');

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`https://api.clerk.com/v1/users/${clerkUserId}`, {
          headers: {
            Authorization: `Bearer ${clerkSecretKey}`,
            'Content-Type': 'application/json',
          },
        })
      );

      return {
        email: data.email_addresses[0].email_address,
        firstName: data.first_name,
        lastName: data.last_name,
      };
    } catch (error) {
      throw new BadRequestException('Failed to get user data from Clerk');
    }
  }
}
