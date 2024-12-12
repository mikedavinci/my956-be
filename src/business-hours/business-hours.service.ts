// src/business-hours/business-hours.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessHours } from './entities/business-hour.entity';
import { BusinessesService } from 'src/business/business.service';
import { CreateBusinessHoursDto } from './dto/create-business-hour.dto';
import { UpdateBusinessHoursDto } from './dto/update-business-hour.dto';

@Injectable()
export class BusinessHoursService {
  constructor(
    @InjectRepository(BusinessHours)
    private readonly businessHoursRepository: Repository<BusinessHours>,
    private readonly businessesService: BusinessesService
  ) {}

  async create(
    createBusinessHoursDto: CreateBusinessHoursDto
  ): Promise<BusinessHours> {
    // Verify business exists
    await this.businessesService.findOne(createBusinessHoursDto.businessId);

    // Check for existing hours for this day
    const existing = await this.businessHoursRepository.findOne({
      where: {
        businessId: createBusinessHoursDto.businessId,
        dayOfWeek: createBusinessHoursDto.dayOfWeek,
      },
      withDeleted: true,
    });

    if (existing) {
      throw new ConflictException(`Business hours already exist for this day`);
    }

    // Validate times if not closed
    if (!createBusinessHoursDto.isClosed) {
      if (createBusinessHoursDto.openTime >= createBusinessHoursDto.closeTime) {
        throw new BadRequestException(
          'Close time must be later than open time'
        );
      }
    }

    const businessHours = this.businessHoursRepository.create(
      createBusinessHoursDto
    );
    return this.businessHoursRepository.save(businessHours);
  }

  async findAll(): Promise<BusinessHours[]> {
    return this.businessHoursRepository.find({
      relations: ['business'],
      order: { dayOfWeek: 'ASC' },
    });
  }

  async findOne(id: string): Promise<BusinessHours> {
    const businessHours = await this.businessHoursRepository.findOne({
      where: { id },
      relations: ['business'],
    });

    if (!businessHours) {
      throw new NotFoundException(`Business hours with ID ${id} not found`);
    }

    return businessHours;
  }

  async findByBusiness(businessId: string): Promise<BusinessHours[]> {
    return this.businessHoursRepository.find({
      where: { businessId },
      order: { dayOfWeek: 'ASC' },
    });
  }

  async update(
    id: string,
    updateBusinessHoursDto: UpdateBusinessHoursDto
  ): Promise<BusinessHours> {
    const businessHours = await this.findOne(id);

    // Validate times if not closed and times are being updated
    if (
      !updateBusinessHoursDto.isClosed &&
      (updateBusinessHoursDto.openTime || updateBusinessHoursDto.closeTime)
    ) {
      const openTime =
        updateBusinessHoursDto.openTime || businessHours.openTime;
      const closeTime =
        updateBusinessHoursDto.closeTime || businessHours.closeTime;

      if (openTime >= closeTime) {
        throw new BadRequestException(
          'Close time must be later than open time'
        );
      }
    }

    Object.assign(businessHours, updateBusinessHoursDto);
    return this.businessHoursRepository.save(businessHours);
  }

  async remove(id: string): Promise<void> {
    const businessHours = await this.findOne(id);
    await this.businessHoursRepository.softDelete(id);
  }

  async isBusinessOpen(
    businessId: string,
    date: Date = new Date()
  ): Promise<boolean> {
    const dayOfWeek = date.getDay();
    const currentTime = date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });

    const businessHours = await this.businessHoursRepository.findOne({
      where: {
        businessId,
        dayOfWeek,
        isClosed: false,
        isHoliday: false,
      },
    });

    if (!businessHours) {
      return false;
    }

    return (
      currentTime >= businessHours.openTime &&
      currentTime <= businessHours.closeTime
    );
  }
}
