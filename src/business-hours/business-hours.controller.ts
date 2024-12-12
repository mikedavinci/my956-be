// src/business-hours/business-hours.controller.ts
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
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BusinessHoursService } from './business-hours.service';

import { BusinessHoursResponseDto } from './dto/business-hours-response.dto';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/user/enums/user-role.enums';
import { Roles } from 'src/decorator/roles.decorator';
import { CreateBusinessHoursDto } from './dto/create-business-hour.dto';
import { DayOfWeek } from './days-of-week.enum';
import { UpdateBusinessHoursDto } from './dto/update-business-hour.dto';

@ApiTags('business-hours')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('business-hours')
export class BusinessHoursController {
  constructor(private readonly businessHoursService: BusinessHoursService) {}

  @Post()
  @Roles(UserRole.BUSINESS_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create business hours' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Business hours have been successfully created.',
    type: BusinessHoursResponseDto,
  })
  async create(
    @Body() createBusinessHoursDto: CreateBusinessHoursDto
  ): Promise<BusinessHoursResponseDto> {
    const businessHours = await this.businessHoursService.create(
      createBusinessHoursDto
    );
    return new BusinessHoursResponseDto(businessHours);
  }

  @Get()
  @ApiOperation({ summary: 'Get all business hours' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all business hours.',
    type: [BusinessHoursResponseDto],
  })
  async findAll(): Promise<BusinessHoursResponseDto[]> {
    const businessHours = await this.businessHoursService.findAll();
    return businessHours.map((hours) => new BusinessHoursResponseDto(hours));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get business hours by ID' })
  @ApiParam({ name: 'id', description: 'Business Hours ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the business hours.',
    type: BusinessHoursResponseDto,
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<BusinessHoursResponseDto> {
    const businessHours = await this.businessHoursService.findOne(id);
    return new BusinessHoursResponseDto(businessHours);
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get business hours by business ID' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the business hours for the business.',
    type: [BusinessHoursResponseDto],
  })
  async findByBusiness(
    @Param('businessId', ParseUUIDPipe) businessId: string
  ): Promise<BusinessHoursResponseDto[]> {
    const businessHours =
      await this.businessHoursService.findByBusiness(businessId);
    return businessHours.map((hours) => new BusinessHoursResponseDto(hours));
  }

  @Get('business/:businessId/status')
  @ApiOperation({ summary: 'Check if business is currently open' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns whether the business is currently open.',
    schema: {
      type: 'object',
      properties: {
        isOpen: { type: 'boolean' },
      },
    },
  })
  async isBusinessOpen(
    @Param('businessId', ParseUUIDPipe) businessId: string
  ): Promise<{ isOpen: boolean }> {
    const isOpen = await this.businessHoursService.isBusinessOpen(businessId);
    return { isOpen };
  }

  @Patch(':id')
  @Roles(UserRole.BUSINESS_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update business hours' })
  @ApiParam({ name: 'id', description: 'Business Hours ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Business hours have been successfully updated.',
    type: BusinessHoursResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid time format or close time before open time.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBusinessHoursDto: UpdateBusinessHoursDto
  ): Promise<BusinessHoursResponseDto> {
    const businessHours = await this.businessHoursService.update(
      id,
      updateBusinessHoursDto
    );
    return new BusinessHoursResponseDto(businessHours);
  }

  @Delete(':id')
  @Roles(UserRole.BUSINESS_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete business hours' })
  @ApiParam({ name: 'id', description: 'Business Hours ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Business hours have been successfully deleted.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.businessHoursService.remove(id);
  }

  @Post('business/:businessId/bulk')
  @Roles(UserRole.BUSINESS_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create business hours in bulk' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Business hours have been successfully created in bulk.',
    type: [BusinessHoursResponseDto],
  })
  async createBulk(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Body()
    createBusinessHoursDtos: Omit<CreateBusinessHoursDto, 'businessId'>[]
  ): Promise<BusinessHoursResponseDto[]> {
    const businessHours = await Promise.all(
      createBusinessHoursDtos.map((dto) =>
        this.businessHoursService.create({
          ...dto,
          businessId,
        })
      )
    );
    return businessHours.map((hours) => new BusinessHoursResponseDto(hours));
  }

  @Patch('business/:businessId/holiday')
  @Roles(UserRole.BUSINESS_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Set holiday status for business hours' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Holiday status has been successfully updated.',
    type: [BusinessHoursResponseDto],
  })
  async setHolidayStatus(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Body() updateDto: { dayOfWeek: DayOfWeek; isHoliday: boolean }
  ): Promise<BusinessHoursResponseDto[]> {
    const businessHours =
      await this.businessHoursService.findByBusiness(businessId);
    const updatedHours = await Promise.all(
      businessHours
        .filter((hours) => hours.dayOfWeek === updateDto.dayOfWeek)
        .map((hours) =>
          this.businessHoursService.update(hours.id, {
            isHoliday: updateDto.isHoliday,
          })
        )
    );
    return updatedHours.map((hours) => new BusinessHoursResponseDto(hours));
  }

  @Get('business/:businessId/next-open')
  @ApiOperation({ summary: 'Get next opening time for business' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the next opening time for the business.',
    schema: {
      type: 'object',
      properties: {
        nextOpenDay: { type: 'string' },
        openTime: { type: 'string' },
        closeTime: { type: 'string' },
      },
    },
  })
  async getNextOpenTime(
    @Param('businessId', ParseUUIDPipe) businessId: string
  ): Promise<{ nextOpenDay: string; openTime: string; closeTime: string }> {
    const businessHours =
      await this.businessHoursService.findByBusiness(businessId);
    const today = new Date();
    const currentDayOfWeek = today.getDay();

    // Find the next open day
    const nextOpenHours = businessHours
      .filter((hours) => !hours.isClosed && !hours.isHoliday)
      .find((hours) => {
        const hoursDayOfWeek = hours.dayOfWeek;
        return (
          hoursDayOfWeek > currentDayOfWeek ||
          (hoursDayOfWeek === currentDayOfWeek &&
            hours.closeTime >
              today.toLocaleTimeString('en-US', { hour12: false }))
        );
      });

    if (!nextOpenHours) {
      throw new NotFoundException('No upcoming business hours found');
    }

    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return {
      nextOpenDay: days[nextOpenHours.dayOfWeek],
      openTime: nextOpenHours.openTime,
      closeTime: nextOpenHours.closeTime,
    };
  }
}
