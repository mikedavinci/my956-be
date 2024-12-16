// src/location/controllers/location-seed.controller.ts
import { Controller, Post, HttpStatus, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationEnum } from './enums/location.enum';
import { Location } from './entities/location.entity';
import { Public } from 'src/auth/public.decorator';

@ApiTags('Location Seeds')
@Controller('locations/seed')
export class LocationSeedController {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>
  ) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Seed locations table with initial data' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Locations have been successfully seeded.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Locations already exist in the database.',
  })
  async seedLocations() {
    // Check if locations already exist
    const existingLocations = await this.locationRepository.find();
    if (existingLocations.length > 0) {
      return {
        status: HttpStatus.CONFLICT,
        message: 'Locations are already seeded',
        count: existingLocations.length,
      };
    }

    const locations = [
      {
        id: LocationEnum.MCALLEN,
        name: 'McAllen',
        state: 'Texas',
        country: 'United States',
      },
      {
        id: LocationEnum.MISSION,
        name: 'Mission',
        state: 'Texas',
        country: 'United States',
      },
      {
        id: LocationEnum.EDINBURG,
        name: 'Edinburg',
        state: 'Texas',
        country: 'United States',
      },
      {
        id: LocationEnum.PHARR,
        name: 'Pharr',
        state: 'Texas',
        country: 'United States',
      },
      {
        id: LocationEnum.WESLACO,
        name: 'Weslaco',
        state: 'Texas',
        country: 'United States',
      },
      {
        id: LocationEnum.HARLINGEN,
        name: 'Harlingen',
        state: 'Texas',
        country: 'United States',
      },
      {
        id: LocationEnum.BROWNSVILLE,
        name: 'Brownsville',
        state: 'Texas',
        country: 'United States',
      },
    ];

    try {
      const savedLocations = await this.locationRepository.save(locations);
      return {
        status: HttpStatus.CREATED,
        message: 'Locations seeded successfully',
        count: savedLocations.length,
        data: savedLocations,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to seed locations',
        error: error.message,
      };
    }
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all locations' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all locations.',
  })
  async getAllLocations() {
    const locations = await this.locationRepository.find();
    return {
      status: HttpStatus.OK,
      count: locations.length,
      data: locations,
    };
  }
}
