// src/subscriptions/subscriptions.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { SubscriptionStatus } from './enums/subscription-status.enum';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/user/enums/user-role.enums';
import { Roles } from 'src/decorator/roles.decorator';

@ApiTags('subscriptions')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @Roles(UserRole.BUSINESS_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Subscription has been successfully created.',
    type: SubscriptionResponseDto,
  })
  async create(
    @Body() createSubscriptionDto: CreateSubscriptionDto
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionsService.create(
      createSubscriptionDto
    );
    return new SubscriptionResponseDto(subscription);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all subscriptions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all subscriptions.',
    type: [SubscriptionResponseDto],
  })
  async findAll(): Promise<SubscriptionResponseDto[]> {
    const subscriptions = await this.subscriptionsService.findAll();
    return subscriptions.map((sub) => new SubscriptionResponseDto(sub));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the subscription.',
    type: SubscriptionResponseDto,
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionsService.findOne(id);
    return new SubscriptionResponseDto(subscription);
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get subscriptions by business ID' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the subscriptions for the business.',
    type: [SubscriptionResponseDto],
  })
  async findByBusiness(
    @Param('businessId', ParseUUIDPipe) businessId: string
  ): Promise<SubscriptionResponseDto[]> {
    const subscriptions =
      await this.subscriptionsService.findByBusiness(businessId);
    return subscriptions.map((sub) => new SubscriptionResponseDto(sub));
  }

  @Get('business/:businessId/active')
  @ApiOperation({ summary: 'Get active subscription for business' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the active subscription for the business.',
    type: SubscriptionResponseDto,
  })
  async getActiveSubscription(
    @Param('businessId', ParseUUIDPipe) businessId: string
  ): Promise<SubscriptionResponseDto> {
    const subscription =
      await this.subscriptionsService.getActiveSubscription(businessId);
    return new SubscriptionResponseDto(subscription);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription has been successfully updated.',
    type: SubscriptionResponseDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionsService.update(
      id,
      updateSubscriptionDto
    );
    return new SubscriptionResponseDto(subscription);
  }

  @Post(':id/cancel')
  @Roles(UserRole.BUSINESS_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription has been successfully cancelled.',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot cancel subscription that is not active.',
  })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionsService.cancel(id);
    return new SubscriptionResponseDto(subscription);
  }

  @Post(':id/reactivate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reactivate cancelled subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription has been successfully reactivated.',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Can only reactivate cancelled subscriptions.',
  })
  async reactivate(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionsService.update(id, {
      status: SubscriptionStatus.ACTIVE,
    });
    return new SubscriptionResponseDto(subscription);
  }

  @Get('check/expired')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Check and update expired subscriptions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Expired subscriptions have been updated.',
  })
  async checkExpiredSubscriptions(): Promise<void> {
    await this.subscriptionsService.checkAndUpdateExpiredSubscriptions();
  }

  @Get('analytics/summary')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get subscription analytics summary' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns subscription analytics summary.',
    schema: {
      type: 'object',
      properties: {
        totalActive: { type: 'number' },
        totalCancelled: { type: 'number' },
        totalExpired: { type: 'number' },
        revenueByPlan: {
          type: 'object',
          properties: {
            BASIC: { type: 'number' },
            PREMIUM: { type: 'number' },
          },
        },
      },
    },
  })
  async getAnalyticsSummary() {
    const [active, cancelled, expired] = await Promise.all([
      this.subscriptionsService.countByStatus(SubscriptionStatus.ACTIVE),
      this.subscriptionsService.countByStatus(SubscriptionStatus.CANCELLED),
      this.subscriptionsService.countByStatus(SubscriptionStatus.EXPIRED),
    ]);

    const revenueByPlan =
      await this.subscriptionsService.calculateRevenueByPlan();

    return {
      totalActive: active,
      totalCancelled: cancelled,
      totalExpired: expired,
      revenueByPlan,
    };
  }
}
