// src/subscriptions/subscriptions.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionStatus } from './enums/subscription-status.enum';
import { BusinessesService } from 'src/business/business.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly businessesService: BusinessesService
  ) {}

  async create(
    createSubscriptionDto: CreateSubscriptionDto
  ): Promise<Subscription> {
    // Verify business exists
    await this.businessesService.findOne(createSubscriptionDto.businessId);

    // Check for active subscription
    const activeSubscription = await this.subscriptionRepository.findOne({
      where: {
        businessId: createSubscriptionDto.businessId,
        status: SubscriptionStatus.ACTIVE,
        endDate: LessThan(new Date()),
      },
    });

    if (activeSubscription) {
      throw new ConflictException(
        'Business already has an active subscription'
      );
    }

    const subscription = this.subscriptionRepository.create({
      ...createSubscriptionDto,
      status: SubscriptionStatus.ACTIVE,
    });

    return this.subscriptionRepository.save(subscription);
  }

  async findAll(): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      relations: ['business'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['business'],
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return subscription;
  }

  async findByBusiness(businessId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { businessId },
      relations: ['business'],
      order: { createdAt: 'DESC' },
    });
  }

  async getActiveSubscription(businessId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        businessId,
        status: SubscriptionStatus.ACTIVE,
        endDate: LessThan(new Date()),
      },
      relations: ['business'],
    });

    if (!subscription) {
      throw new NotFoundException(
        `No active subscription found for business ${businessId}`
      );
    }

    return subscription;
  }

  async update(
    id: string,
    updateSubscriptionDto: UpdateSubscriptionDto
  ): Promise<Subscription> {
    const subscription = await this.findOne(id);

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      throw new BadRequestException('Cannot update cancelled subscription');
    }

    Object.assign(subscription, updateSubscriptionDto);
    return this.subscriptionRepository.save(subscription);
  }

  async cancel(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new BadRequestException(
        'Only active subscriptions can be cancelled'
      );
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    return this.subscriptionRepository.save(subscription);
  }

  async checkAndUpdateExpiredSubscriptions(): Promise<void> {
    const expiredSubscriptions = await this.subscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: LessThan(new Date()),
      },
    });

    for (const subscription of expiredSubscriptions) {
      subscription.status = SubscriptionStatus.EXPIRED;
      await this.subscriptionRepository.save(subscription);
    }
  }

  async countByStatus(status: SubscriptionStatus): Promise<number> {
    return this.subscriptionRepository.count({
      where: { status },
    });
  }

  async calculateRevenueByPlan(): Promise<Record<string, number>> {
    const subscriptions = await this.subscriptionRepository.find({
      where: { status: SubscriptionStatus.ACTIVE },
    });

    return subscriptions.reduce(
      (acc, sub) => {
        acc[sub.plan] = (acc[sub.plan] || 0) + Number(sub.price);
        return acc;
      },
      {} as Record<string, number>
    );
  }
}
