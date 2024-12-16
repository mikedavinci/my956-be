import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { LocationsService } from './location.service';
import { LocationSeedController } from './location.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Location])],
  controllers: [LocationSeedController],
  providers: [LocationsService],
})
export class LocationModule {}
