// src/locations/locations.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>
  ) {}

  // async create(createLocationDto: CreateLocationDto): Promise<Location> {
  //   const existingLocation = await this.locationRepository.findOne({
  //     where: [
  //       { slug: createLocationDto.slug },
  //       { name: createLocationDto.name, state: createLocationDto.state },
  //     ],
  //     withDeleted: true,
  //   });

  //   if (existingLocation) {
  //     throw new ConflictException(
  //       'Location with this name or slug already exists'
  //     );
  //   }

  //   const location = this.locationRepository.create(createLocationDto);
  //   return this.locationRepository.save(location);
  // }

  // async findAll(): Promise<Location[]> {
  //   return this.locationRepository.find({
  //     where: { isActive: true },
  //     order: { name: 'ASC' },
  //   });
  // }

  // async findOne(id: string): Promise<Location> {
  //   const location = await this.locationRepository.findOne({
  //     where: { id },
  //   });

  //   if (!location) {
  //     throw new NotFoundException(`Location with ID ${id} not found`);
  //   }

  //   return location;
  // }

  // async findBySlug(slug: string): Promise<Location> {
  //   const location = await this.locationRepository.findOne({
  //     where: { slug },
  //   });

  //   if (!location) {
  //     throw new NotFoundException(`Location with slug ${slug} not found`);
  //   }

  //   return location;
  // }

  // async update(
  //   id: string,
  //   updateLocationDto: UpdateLocationDto
  // ): Promise<Location> {
  //   const location = await this.findOne(id);

  //   if (updateLocationDto.name) {
  //     const existingLocation = await this.locationRepository.findOne({
  //       where: {
  //         name: updateLocationDto.name,
  //         state: updateLocationDto.state || location.state,
  //         id: Not(id),
  //       },
  //     });

  //     if (existingLocation) {
  //       throw new ConflictException(
  //         'Location with this name already exists in this state'
  //       );
  //     }
  //   }

  //   Object.assign(location, updateLocationDto);
  //   return this.locationRepository.save(location);
  // }

  // async remove(id: string): Promise<void> {
  //   const location = await this.findOne(id);
  //   await this.locationRepository.softDelete(id);
  // }

  // async findByCountry(country: string): Promise<Location[]> {
  //   return this.locationRepository.find({
  //     where: { country, isActive: true },
  //     order: { name: 'ASC' },
  //   });
  // }

  // async findByState(state: string): Promise<Location[]> {
  //   return this.locationRepository.find({
  //     where: { state, isActive: true },
  //     order: { name: 'ASC' },
  //   });
  // }
}
