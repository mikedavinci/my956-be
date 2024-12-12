import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { BusinessesController } from './business.controller';
import { BusinessesService } from './business.service';
import { QRCodeService } from './qr-code.service';

@Module({
  imports: [TypeOrmModule.forFeature([Business])],
  controllers: [BusinessesController],
  providers: [BusinessesService, QRCodeService],
  exports: [BusinessesService],
})
export class BusinessesModule {}
