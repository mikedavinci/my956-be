// src/social-media/social-media.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialMedia } from './entities/socialmedia.entity';
import { BusinessesService } from 'src/business/business.service';
import { CreateSocialMediaDto } from './dto/create-socialmedia.dto';
import { UpdateSocialMediaDto } from './dto/update-socialmedia.dto';

@Injectable()
export class SocialMediaService {
  constructor(
    @InjectRepository(SocialMedia)
    private readonly socialMediaRepository: Repository<SocialMedia>,
    private readonly businessesService: BusinessesService
  ) {}

  async create(
    createSocialMediaDto: CreateSocialMediaDto
  ): Promise<SocialMedia> {
    // Verify business exists
    await this.businessesService.findOne(createSocialMediaDto.businessId);

    // Check for existing platform for this business
    const existing = await this.socialMediaRepository.findOne({
      where: {
        businessId: createSocialMediaDto.businessId,
        platform: createSocialMediaDto.platform,
      },
      withDeleted: true,
    });

    if (existing) {
      throw new ConflictException(
        `${createSocialMediaDto.platform} account already exists for this business`
      );
    }

    const socialMedia = this.socialMediaRepository.create(createSocialMediaDto);
    return this.socialMediaRepository.save(socialMedia);
  }

  async findAll(): Promise<SocialMedia[]> {
    return this.socialMediaRepository.find({
      relations: ['business'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<SocialMedia> {
    const socialMedia = await this.socialMediaRepository.findOne({
      where: { id },
      relations: ['business'],
    });

    if (!socialMedia) {
      throw new NotFoundException(`Social media with ID ${id} not found`);
    }

    return socialMedia;
  }

  async findByBusiness(businessId: string): Promise<SocialMedia[]> {
    return this.socialMediaRepository.find({
      where: { businessId },
      order: { platform: 'ASC' },
    });
  }

  async update(
    id: string,
    updateSocialMediaDto: UpdateSocialMediaDto
  ): Promise<SocialMedia> {
    const socialMedia = await this.findOne(id);
    Object.assign(socialMedia, updateSocialMediaDto);
    return this.socialMediaRepository.save(socialMedia);
  }

  async remove(id: string): Promise<void> {
    const socialMedia = await this.findOne(id);
    await this.socialMediaRepository.softDelete(id);
  }

  async updateFollowers(id: string, followers: number): Promise<SocialMedia> {
    const socialMedia = await this.findOne(id);
    socialMedia.followers = followers;
    socialMedia.lastSynced = new Date();
    return this.socialMediaRepository.save(socialMedia);
  }
}
