import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialMediaService } from './socialmedia.service';
import { SocialMediaController } from './socialmedia.controller';
import { SocialMedia } from './entities/socialmedia.entity';
import { BusinessesModule } from 'src/business/business.module';

@Module({
  imports: [TypeOrmModule.forFeature([SocialMedia]), BusinessesModule],
  controllers: [SocialMediaController],
  providers: [SocialMediaService],
})
export class SocialmediaModule {}
