// src/social-media/social-media.controller.ts
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
import { SocialMediaResponseDto } from './dto/social-media-response.dto';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { SocialMediaService } from './socialmedia.service';
import { UserRole } from 'src/user/enums/user-role.enums';
import { Roles } from 'src/decorator/roles.decorator';
import { CreateSocialMediaDto } from './dto/create-socialmedia.dto';
import { UpdateSocialMediaDto } from './dto/update-socialmedia.dto';

@ApiTags('social-media')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('social-media')
export class SocialMediaController {
  constructor(private readonly socialMediaService: SocialMediaService) {}

  @Post()
  @Roles(UserRole.BUSINESS_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new social media link' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Social media link has been successfully created.',
    type: SocialMediaResponseDto,
  })
  async create(
    @Body() createSocialMediaDto: CreateSocialMediaDto
  ): Promise<SocialMediaResponseDto> {
    const socialMedia =
      await this.socialMediaService.create(createSocialMediaDto);
    return new SocialMediaResponseDto(socialMedia);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all social media links' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all social media links.',
    type: [SocialMediaResponseDto],
  })
  async findAll(): Promise<SocialMediaResponseDto[]> {
    const socialMedias = await this.socialMediaService.findAll();
    return socialMedias.map((sm) => new SocialMediaResponseDto(sm));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get social media link by ID' })
  @ApiParam({ name: 'id', description: 'Social Media ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the social media link.',
    type: SocialMediaResponseDto,
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<SocialMediaResponseDto> {
    const socialMedia = await this.socialMediaService.findOne(id);
    return new SocialMediaResponseDto(socialMedia);
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get social media links by business ID' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the social media links for the business.',
    type: [SocialMediaResponseDto],
  })
  async findByBusiness(
    @Param('businessId', ParseUUIDPipe) businessId: string
  ): Promise<SocialMediaResponseDto[]> {
    const socialMedias =
      await this.socialMediaService.findByBusiness(businessId);
    return socialMedias.map((sm) => new SocialMediaResponseDto(sm));
  }

  @Patch(':id')
  @Roles(UserRole.BUSINESS_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update social media link' })
  @ApiParam({ name: 'id', description: 'Social Media ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Social media link has been successfully updated.',
    type: SocialMediaResponseDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSocialMediaDto: UpdateSocialMediaDto
  ): Promise<SocialMediaResponseDto> {
    const socialMedia = await this.socialMediaService.update(
      id,
      updateSocialMediaDto
    );
    return new SocialMediaResponseDto(socialMedia);
  }

  @Delete(':id')
  @Roles(UserRole.BUSINESS_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete social media link' })
  @ApiParam({ name: 'id', description: 'Social Media ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Social media link has been successfully deleted.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.socialMediaService.remove(id);
  }

  @Patch(':id/sync-followers')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update social media followers count' })
  @ApiParam({ name: 'id', description: 'Social Media ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Followers count has been successfully updated.',
    type: SocialMediaResponseDto,
  })
  async updateFollowers(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('followers') followers: number
  ): Promise<SocialMediaResponseDto> {
    const socialMedia = await this.socialMediaService.updateFollowers(
      id,
      followers
    );
    return new SocialMediaResponseDto(socialMedia);
  }
}
