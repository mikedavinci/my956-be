import { ConfigService } from '@nestjs/config';
// src/businesses/businesses.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Business } from './entities/business.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { User } from 'src/user/entities/user.entity';
import { QRCodeService } from './qr-code.service';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    private readonly qrCodeService: QRCodeService,
    private readonly configService: ConfigService
  ) {}

  async create(
    createBusinessDto: CreateBusinessDto,
    user: User
  ): Promise<Business> {
    const existingBusiness = await this.businessRepository.findOne({
      where: [
        { slug: createBusinessDto.slug },
        {
          name: createBusinessDto.name,
          locationId: createBusinessDto.locationId,
        },
      ],
      withDeleted: true,
    });

    if (existingBusiness) {
      throw new ConflictException(
        'Business with this name or slug already exists'
      );
    }

    const business = this.businessRepository.create({
      ...createBusinessDto,
      rating: 0,
      reviewCount: 0,
      userId: user.id,
    });

    return this.businessRepository.save(business);
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

  private async uploadQRCode(buffer: Buffer, slug: string): Promise<string> {
    // Implement your file upload logic here
    // This could be AWS S3, Google Cloud Storage, etc.
    // For now, returning a placeholder URL
    return `${this.configService.get('BASE_URL')}/qr-codes/${slug}.png`;
  }
}
