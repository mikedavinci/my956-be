import { ConfigService } from '@nestjs/config';
// src/businesses/businesses.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Business } from './entities/business.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { User } from 'src/user/entities/user.entity';
import { QRCodeService } from './qr-code.service';
import { BusinessStatus } from './enums/business-status.enum';
import { InvitationStatus } from 'src/invitation/enums/invitation-status.enum';
import { Invitation } from 'src/invitation/entities/invitation.entity';
import * as AWS from 'aws-sdk';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    private readonly qrCodeService: QRCodeService,
    private readonly configService: ConfigService
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(createBusinessDto: CreateBusinessDto): Promise<Business> {
    return this.businessRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const invitation = await transactionalEntityManager.findOne(
          Invitation,
          {
            where: {
              clerkInvitationId: createBusinessDto.clerkInvitationId,
              status: In([InvitationStatus.PENDING, InvitationStatus.ACCEPTED]),
            },
            relations: ['acceptedByUser'],
          }
        );

        if (!invitation) {
          throw new NotFoundException('Valid invitation not found');
        }

        // 2. Generate slug
        let slug =
          createBusinessDto.slug || this.generateSlug(createBusinessDto.name);

        // 3. Check for slug uniqueness
        const existingBusiness = await transactionalEntityManager.findOne(
          Business,
          {
            where: { slug },
          }
        );

        if (existingBusiness) {
          // If slug exists, append a random string
          slug = `${slug}-${Math.random().toString(36).substring(2, 8)}`;
        }

        // 4. Generate QR code
        const qrCodeBuffer =
          await this.qrCodeService.generateQRCodeBuffer(slug);
        const qrCodeUrl = await this.uploadQRCode(qrCodeBuffer, slug);

        // 5. Create business entity
        const business = this.businessRepository.create({
          ...createBusinessDto,
          slug,
          userId: invitation.acceptedByUserId, // This might be null for pending invitations
          rating: 0,
          reviewCount: 0,
          status: BusinessStatus.PENDING,
          locationId: createBusinessDto.locationId,
          qrCodeUrl,
          qrCodeGeneratedAt: new Date(),
        });

        // 6. Save business
        const savedBusiness = await transactionalEntityManager.save(
          Business,
          business
        );

        // 7. Update invitation with business ID
        invitation.businessId = savedBusiness.id;
        await transactionalEntityManager.save(Invitation, invitation);

        // 8. Return saved business with populated relations
        return transactionalEntityManager.findOne(Business, {
          where: { id: savedBusiness.id },
          relations: ['user'],
        });
      }
    );
  }

  async findAll(): Promise<Business[]> {
    return this.businessRepository.find({
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    return business;
  }

  async findBySlug(slug: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { slug },
      relations: ['user'],
    });

    if (!business) {
      throw new NotFoundException(`Business with slug ${slug} not found`);
    }

    return business;
  }

  async update(
    id: string,
    updateBusinessDto: UpdateBusinessDto
  ): Promise<Business> {
    const business = await this.findOne(id);

    // Check for name uniqueness in location if name is being updated
    if (updateBusinessDto.name && updateBusinessDto.name !== business.name) {
      const existingBusiness = await this.businessRepository.findOne({
        where: {
          name: updateBusinessDto.name,
          locationId: business.locationId,
          id: Not(id),
        },
      });

      if (existingBusiness) {
        throw new ConflictException(
          'Business with this name already exists in this location'
        );
      }
    }

    Object.assign(business, updateBusinessDto);
    return this.businessRepository.save(business);
  }

  async remove(id: string): Promise<void> {
    const business = await this.findOne(id);
    await this.businessRepository.softDelete(id);
  }

  async findByUser(userId: string): Promise<Business[]> {
    return this.businessRepository.find({
      where: { userId },
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async updateRating(
    id: string,
    rating: number,
    reviewCount: number
  ): Promise<Business> {
    const business = await this.findOne(id);
    business.rating = rating;
    business.reviewCount = reviewCount;
    return this.businessRepository.save(business);
  }

  async generateQRCode(id: string): Promise<Business> {
    const business = await this.findOne(id);

    // Generate QR code
    const qrCodeBuffer = await this.qrCodeService.generateQRCodeBuffer(
      business.slug
    );

    // Here you would upload the buffer to your storage service
    // This is a placeholder for where you'd implement your file upload logic
    const qrCodeUrl = await this.uploadQRCode(qrCodeBuffer, business.slug);

    // Update business with QR code URL
    business.qrCodeUrl = qrCodeUrl;
    business.qrCodeGeneratedAt = new Date();

    return this.businessRepository.save(business);
  }

  // Update uploadQRCode method to actually upload to S3 or your storage service
  private async uploadQRCode(buffer: Buffer, slug: string): Promise<string> {
    try {
      const s3 = new AWS.S3();
      const result = await s3
        .upload({
          Bucket: this.configService.get('AWS_S3_BUCKET'),
          Key: `qr-codes/${slug}.png`,
          Body: buffer,
          ContentType: 'image/png',
        })
        .promise();

      return result.Location;
    } catch (error) {
      console.error('Error uploading QR code:', error);
      throw new Error('Failed to upload QR code to S3');
    }
  }
}
