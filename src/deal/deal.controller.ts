// src/deals/deals.controller.ts
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
  Query,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { DealResponseDto } from './dto/deal-response.dto';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

import { DealStatus } from './enums/deal-status.enum';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/user/enums/user-role.enums';
import { DealsService } from './deal.service';
import { Roles } from 'src/decorator/roles.decorator';
import { Deal } from './entities/deal.entity';

@ApiTags('deals')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  @Roles(UserRole.BUSINESS_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new deal' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Deal has been successfully created.',
    type: DealResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid deal data.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Deal code already exists.',
  })
  async create(@Body() createDealDto: CreateDealDto): Promise<DealResponseDto> {
    const deal = await this.dealsService.create(createDealDto);
    return new DealResponseDto(deal);
  }

  @Get()
  @ApiOperation({ summary: 'Get all deals' })
  @ApiQuery({ name: 'status', required: false, enum: DealStatus })
  @ApiQuery({ name: 'businessId', required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all deals.',
    type: [DealResponseDto],
  })
  async findAll(
    @Query('status') status?: DealStatus,
    @Query('businessId') businessId?: string
  ): Promise<DealResponseDto[]> {
    let deals: Deal[];

    if (businessId) {
      deals = await this.dealsService.findByBusiness(businessId);
    } else {
      deals = await this.dealsService.findAll();
    }

    if (status) {
      deals = deals.filter((deal) => deal.status === status);
    }

    return deals.map((deal) => new DealResponseDto(deal));
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active deals' })
  @ApiQuery({ name: 'businessId', required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all active deals.',
    type: [DealResponseDto],
  })
  async findActiveDeals(
    @Query('businessId') businessId?: string
  ): Promise<DealResponseDto[]> {
    const deals = await this.dealsService.findActiveDeals(businessId);
    return deals.map((deal) => new DealResponseDto(deal));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deal by ID' })
  @ApiParam({ name: 'id', description: 'Deal ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the deal.',
    type: DealResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Deal not found.' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<DealResponseDto> {
    const deal = await this.dealsService.findOne(id);
    return new DealResponseDto(deal);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get deal by code' })
  @ApiParam({ name: 'code', description: 'Deal Code' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the deal.',
    type: DealResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Deal not found.' })
  async findByCode(@Param('code') code: string): Promise<DealResponseDto> {
    const deal = await this.dealsService.findByCode(code);
    return new DealResponseDto(deal);
  }

  @Patch(':id')
  @Roles(UserRole.BUSINESS_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update deal' })
  @ApiParam({ name: 'id', description: 'Deal ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Deal has been successfully updated.',
    type: DealResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid deal data.',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Deal not found.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDealDto: UpdateDealDto
  ): Promise<DealResponseDto> {
    const deal = await this.dealsService.update(id, updateDealDto);
    return new DealResponseDto(deal);
  }

  @Delete(':id')
  @Roles(UserRole.BUSINESS_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete deal' })
  @ApiParam({ name: 'id', description: 'Deal ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Deal has been successfully deleted.',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Deal not found.' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.dealsService.remove(id);
  }

  @Post(':id/redeem')
  @Roles(UserRole.BUSINESS_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Redeem a deal' })
  @ApiParam({ name: 'id', description: 'Deal ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Deal has been successfully redeemed.',
    type: DealResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Deal cannot be redeemed.',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Deal not found.' })
  async redeem(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<DealResponseDto> {
    const deal = await this.dealsService.incrementRedemption(id);
    return new DealResponseDto(deal);
  }

  @Patch(':id/status')
  @Roles(UserRole.BUSINESS_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update deal status' })
  @ApiParam({ name: 'id', description: 'Deal ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Deal status has been successfully updated.',
    type: DealResponseDto,
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: DealStatus
  ): Promise<DealResponseDto> {
    const deal = await this.dealsService.update(id, { status });
    return new DealResponseDto(deal);
  }

  @Get('analytics/business/:businessId')
  @Roles(UserRole.BUSINESS_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get deal analytics for a business' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns deal analytics for the business.',
    schema: {
      type: 'object',
      properties: {
        totalDeals: { type: 'number' },
        activeDeals: { type: 'number' },
        totalRedemptions: { type: 'number' },
        averageDiscount: { type: 'number' },
        mostRedeemedDeal: { type: 'object' },
      },
    },
  })
  async getBusinessAnalytics(
    @Param('businessId', ParseUUIDPipe) businessId: string
  ) {
    const deals = await this.dealsService.findByBusiness(businessId);

    const activeDeals = deals.filter(
      (deal) => deal.status === DealStatus.ACTIVE && !deal.isExpired
    );

    const totalRedemptions = deals.reduce(
      (sum, deal) => sum + deal.redemptionCount,
      0
    );

    const averageDiscount =
      deals.reduce((sum, deal) => sum + deal.discountPercentage, 0) /
      (deals.length || 1);

    const mostRedeemedDeal = [...deals].sort(
      (a, b) => b.redemptionCount - a.redemptionCount
    )[0];

    return {
      totalDeals: deals.length,
      activeDeals: activeDeals.length,
      totalRedemptions,
      averageDiscount,
      mostRedeemedDeal: mostRedeemedDeal
        ? new DealResponseDto(mostRedeemedDeal)
        : null,
    };
  }
}
