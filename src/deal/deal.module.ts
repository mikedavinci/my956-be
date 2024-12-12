import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DealsService } from './deal.service';
import { DealsController } from './deal.controller';
import { Deal } from './entities/deal.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserModule } from '../user/user.module';
import { BusinessesModule } from '../business/business.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deal]),
    BusinessesModule,
    NotificationsModule,
    UserModule,
  ],
  controllers: [DealsController],
  providers: [DealsService],
})
export class DealModule {}
