// src/locations/locations.controller.ts
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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationResponseDto } from './dto/location-response.dto';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/user/enums/user-role.enums';
import { Roles } from 'src/decorator/roles.decorator';
import { LocationsService } from './location.service';
import { Location } from './entities/location.entity';

@ApiTags('locations')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new location' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Location has been successfully created.',
    type: LocationResponseDto,
  })
  async create(
    @Body() createLocationDto: CreateLocationDto
  ): Promise<LocationResponseDto> {
    const location = await this.locationsService.create(createLocationDto);
    return new LocationResponseDto(location);
  }

  @Get()
  @ApiOperation({ summary: 'Get all locations' })
  @ApiQuery({ name: 'country', required: false })
  @ApiQuery({ name: 'state', required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all locations.',
    type: [LocationResponseDto],
  })
  async findAll(
    @Query('country') country?: string,
    @Query('state') state?: string
  ): Promise<LocationResponseDto[]> {
    let locations: Location[];

    if (country) {
      locations = await this.locationsService.findByCountry(country);
    } else if (state) {
      locations = await this.locationsService.findByState(state);
    } else {
      locations = await this.locationsService.findAll();
    }

    return locations.map((location) => new LocationResponseDto(location));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get location by ID' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the location.',
    type: LocationResponseDto,
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<LocationResponseDto> {
    const location = await this.locationsService.findOne(id);
    return new LocationResponseDto(location);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get location by slug' })
  @ApiParam({ name: 'slug', description: 'Location slug' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the location.',
    type: LocationResponseDto,
  })
  async findBySlug(@Param('slug') slug: string): Promise<LocationResponseDto> {
    const location = await this.locationsService.findBySlug(slug);
    return new LocationResponseDto(location);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update location' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Location has been successfully updated.',
    type: LocationResponseDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLocationDto: UpdateLocationDto
  ): Promise<LocationResponseDto> {
    const location = await this.locationsService.update(id, updateLocationDto);
    return new LocationResponseDto(location);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete location' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Location has been successfully deleted.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.locationsService.remove(id);
  }
}
