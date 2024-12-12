// src/businesses/businesses.controller.ts
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
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { BusinessResponseDto } from './dto/business-response.dto';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/user/enums/user-role.enums';
import { Roles } from 'src/decorator/roles.decorator';
import { CurrentUser } from 'src/decorator/current-user.decorator';
import { BusinessesService } from './business.service';
import { Response } from 'express';
import { QRCodeService } from './qr-code.service';

@ApiTags('businesses')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('businesses')
export class BusinessesController {
  constructor(
    private readonly businessesService: BusinessesService,
    private readonly qrCodeService: QRCodeService
  ) {}

  @Post()
  @Roles(UserRole.BUSINESS_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new business' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Business has been successfully created.',
    type: BusinessResponseDto,
  })
  async create(
    @Body() createBusinessDto: CreateBusinessDto,
    @CurrentUser() user: any
  ): Promise<BusinessResponseDto> {
    const business = await this.businessesService.create(
      createBusinessDto,
      user
    );
    return new BusinessResponseDto(business);
  }

  @Get()
  @ApiOperation({ summary: 'Get all businesses' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all businesses.',
    type: [BusinessResponseDto],
  })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'featured', required: false })
  async findAll(
    @Query('category') category?: string,
    @Query('featured') featured?: boolean
  ): Promise<BusinessResponseDto[]> {
    const businesses = await this.businessesService.findAll();
    return businesses.map((business) => new BusinessResponseDto(business));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get business by ID' })
  @ApiParam({ name: 'id', description: 'Business ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the business.',
    type: BusinessResponseDto,
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<BusinessResponseDto> {
    const business = await this.businessesService.findOne(id);
    return new BusinessResponseDto(business);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get business by slug' })
  @ApiParam({ name: 'slug', description: 'Business slug' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the business.',
    type: BusinessResponseDto,
  })
  async findBySlug(@Param('slug') slug: string): Promise<BusinessResponseDto> {
    const business = await this.businessesService.findBySlug(slug);
    return new BusinessResponseDto(business);
  }

  @Patch(':id')
  @Roles(UserRole.BUSINESS_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update business' })
  @ApiParam({ name: 'id', description: 'Business ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Business has been successfully updated.',
    type: BusinessResponseDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @CurrentUser() user: any
  ): Promise<BusinessResponseDto> {
    const business = await this.businessesService.update(id, updateBusinessDto);
    return new BusinessResponseDto(business);
  }

  @Delete(':id')
  @Roles(UserRole.BUSINESS_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete business' })
  @ApiParam({ name: 'id', description: 'Business ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Business has been successfully deleted.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.businessesService.remove(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get businesses by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the businesses for the user.',
    type: [BusinessResponseDto],
  })
  async findByUser(
    @Param('userId', ParseUUIDPipe) userId: string
  ): Promise<BusinessResponseDto[]> {
    const businesses = await this.businessesService.findByUser(userId);
    return businesses.map((business) => new BusinessResponseDto(business));
  }

  @Get(':id/qr-code')
  @ApiOperation({ summary: 'Get business QR code' })
  @ApiParam({ name: 'id', description: 'Business ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the business QR code as SVG.',
    schema: {
      type: 'object',
      properties: {
        qrCode: { type: 'string' },
      },
    },
  })
  async getQRCode(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<{ qrCode: string }> {
    const business = await this.businessesService.findOne(id);
    const qrCode = await this.qrCodeService.generateQRCode(business.slug);
    return { qrCode };
  }

  @Get(':id/qr-code/download')
  @ApiOperation({ summary: 'Download business QR code as PNG' })
  @ApiParam({ name: 'id', description: 'Business ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the business QR code as PNG file.',
  })
  async downloadQRCode(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response
  ): Promise<void> {
    const business = await this.businessesService.findOne(id);
    const qrCodeBuffer = await this.qrCodeService.generateQRCodeBuffer(
      business.slug
    );

    res.setHeader('Content-Type', 'image/png');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${business.slug}-qr-code.png`
    );
    res.send(qrCodeBuffer);
  }

  @Post(':id/qr-code/generate')
  @Roles(UserRole.BUSINESS_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Generate and save business QR code' })
  @ApiParam({ name: 'id', description: 'Business ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'QR code has been generated and saved.',
    type: BusinessResponseDto,
  })
  async generateQRCode(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<BusinessResponseDto> {
    const business = await this.businessesService.generateQRCode(id);
    return new BusinessResponseDto(business);
  }
}
