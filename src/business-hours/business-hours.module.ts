import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessHoursService } from './business-hours.service';
import { BusinessHoursController } from './business-hours.controller';
import { BusinessHours } from './entities/business-hour.entity';
import { BusinessesModule } from 'src/business/business.module';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessHours]), BusinessesModule],
  controllers: [BusinessHoursController],
  providers: [BusinessHoursService],
})
export class BusinessHoursModule {}
