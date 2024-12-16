import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Business } from './entities/business.entity';
import { BusinessImage } from './entities/business-image.entity'; // Add this
import { BusinessesController } from './business.controller';
import { BusinessesService } from './business.service';
import { QRCodeService } from './qr-code.service';
import { BusinessImageController } from './business-image.controller';
import { BusinessImageService } from './business-image.service';
import { Location } from 'src/location/entities/location.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, BusinessImage, Location]),
    ConfigModule,
  ],
  controllers: [BusinessesController, BusinessImageController],
  providers: [BusinessesService, QRCodeService, BusinessImageService],
  exports: [BusinessesService],
})
export class BusinessesModule {}