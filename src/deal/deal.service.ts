// src/deals/deals.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Deal } from './entities/deal.entity';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { DealStatus } from './enums/deal-status.enum';
import { BusinessesService } from 'src/business/business.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { UsersService } from 'src/user/user.service';

@Injectable()
export class DealsService {
  constructor(
    @InjectRepository(Deal)
    private readonly dealRepository: Repository<Deal>,
    private readonly businessesService: BusinessesService,
    private readonly notificationsService: NotificationsService,
    private readonly userService: UsersService
  ) {}

  private async getUsersToNotify(businessId: string): Promise<string[]> {
    return this.userService.findUsersToNotify(businessId);
  }

  async create(createDealDto: CreateDealDto): Promise<Deal> {
    const business = await this.businessesService.findOne(
      createDealDto.businessId
    );
    const deal = await this.dealRepository.create(createDealDto);
    const savedDeal = await this.dealRepository.save(deal);

    // Create notifications for users
    // This could be based on user preferences, business followers, etc.
    const usersToNotify = await this.getUsersToNotify(business.id);

    await Promise.all(
      usersToNotify.map((userId) =>
        this.notificationsService.createDealNotification(
          userId,
          savedDeal.id,
          savedDeal.title,
          business.name
        )
      )
    );

    return savedDeal;
  }

  async findAll(): Promise<Deal[]> {
    return this.dealRepository.find({
      relations: ['business'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Deal> {
    const deal = await this.dealRepository.findOne({
      where: { id },
      relations: ['business'],
    });

    if (!deal) {
      throw new NotFoundException(`Deal with ID ${id} not found`);
    }

    return deal;
  }

  async findByCode(code: string): Promise<Deal> {
    const deal = await this.dealRepository.findOne({
      where: { code },
      relations: ['business'],
    });

    if (!deal) {
      throw new NotFoundException(`Deal with code ${code} not found`);
    }

    return deal;
  }

  async findByBusiness(businessId: string): Promise<Deal[]> {
    return this.dealRepository.find({
      where: { businessId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateDealDto: UpdateDealDto): Promise<Deal> {
    const deal = await this.findOne(id);
    const business = await this.businessesService.findOne(deal.businessId);

    // If status is being updated to ACTIVE, notify users
    if (
      updateDealDto.status === DealStatus.ACTIVE &&
      deal.status !== DealStatus.ACTIVE
    ) {
      const usersToNotify = await this.getUsersToNotify(business.id);

      await Promise.all(
        usersToNotify.map((userId) =>
          this.notificationsService.createDealNotification(
            userId,
            deal.id,
            deal.title,
            business.name
          )
        )
      );
    }

    Object.assign(deal, updateDealDto);
    return this.dealRepository.save(deal);
  }

  async remove(id: string): Promise<void> {
    const deal = await this.findOne(id);
    await this.dealRepository.softDelete(id);
  }

  async incrementRedemption(id: string): Promise<Deal> {
    const deal = await this.findOne(id);

    if (deal.status !== DealStatus.ACTIVE) {
      throw new BadRequestException('Deal is not active');
    }

    if (deal.isExpired) {
      throw new BadRequestException('Deal has expired');
    }

    if (deal.maxRedemptions && deal.redemptionCount >= deal.maxRedemptions) {
      throw new BadRequestException('Deal has reached maximum redemptions');
    }

    deal.redemptionCount += 1;
    return this.dealRepository.save(deal);
  }

  async findActiveDeals(businessId?: string): Promise<Deal[]> {
    const query = this.dealRepository
      .createQueryBuilder('deal')
      .where('deal.status = :status', { status: DealStatus.ACTIVE })
      .andWhere('deal.startDate <= :now', { now: new Date() })
      .andWhere('deal.endDate > :now', { now: new Date() })
      .orderBy('deal.createdAt', 'DESC');

    if (businessId) {
      query.andWhere('deal.businessId = :businessId', { businessId });
    }

    return query.getMany();
  }

  async checkExpiringDeals(): Promise<void> {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const expiringDeals = await this.dealRepository.find({
      where: {
        status: DealStatus.ACTIVE,
        endDate: LessThanOrEqual(threeDaysFromNow),
      },
      relations: ['business'],
    });

    for (const deal of expiringDeals) {
      const usersToNotify = await this.getUsersToNotify(deal.businessId);

      await Promise.all(
        usersToNotify.map((userId) =>
          this.notificationsService.createDealExpirationNotification(
            userId,
            deal.id,
            deal.title,
            deal.endDate
          )
        )
      );
    }
  }
}
