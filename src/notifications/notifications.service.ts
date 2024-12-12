// src/notifications/notifications.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationType } from './enums/notification-type.enum';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto
  ): Promise<Notification> {
    const notification = this.notificationRepository.create(
      createNotificationDto
    );
    return this.notificationRepository.save(notification);
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async findByUser(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto
  ): Promise<Notification> {
    const notification = await this.findOne(id);
    Object.assign(notification, updateNotificationDto);
    return this.notificationRepository.save(notification);
  }

  async remove(id: string): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationRepository.softDelete(id);
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true }
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  // Deal-specific notification methods
  async createDealNotification(
    userId: string,
    dealId: string,
    dealTitle: string,
    businessName: string
  ): Promise<Notification> {
    const notification = await this.create({
      userId,
      type: NotificationType.DEAL,
      title: 'New Deal Available!',
      message: `${businessName} has posted a new deal: ${dealTitle}`,
      relatedId: dealId,
      metadata: {
        dealId,
        businessName,
      },
    });

    return notification;
  }

  async createDealExpirationNotification(
    userId: string,
    dealId: string,
    dealTitle: string,
    expirationDate: Date
  ): Promise<Notification> {
    const notification = await this.create({
      userId,
      type: NotificationType.DEAL,
      title: 'Deal Expiring Soon!',
      message: `The deal "${dealTitle}" is expiring on ${expirationDate.toLocaleDateString()}`,
      relatedId: dealId,
      metadata: {
        dealId,
        expirationDate,
      },
    });

    return notification;
  }
}
