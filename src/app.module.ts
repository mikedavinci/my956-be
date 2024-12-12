import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { HttpModule } from '@nestjs/axios';
import { ClerkMiddleware } from './auth/clerk.middleware';
import { ClerkAuthGuard } from './auth/clerk-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { UserModule } from './user/user.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { LocationModule } from './location/location.module';
import { SocialmediaModule } from './socialmedia/socialmedia.module';
import { BusinessHoursModule } from './business-hours/business-hours.module';
import { DealModule } from './deal/deal.module';
import { NotificationsModule } from './notifications/notifications.module';
import { BusinessesModule } from './business/business.module';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env' : '.env.development',
    }),
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule,
        ThrottlerModule.forRoot([
          {
            ttl: 30,
            limit: 1000,
          },
        ]),
      ],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        autoLoadEntities: true,
        url: 'postgresql://doadmin:AVNS_FMfFhh6psrZoq1lkqkB@db-postgresql-nyc3-59643-do-user-2321004-0.g.db.ondigitalocean.com:25060/my956',
        synchronize:
          configService.get('NODE_ENV') !== 'production' ? true : true,
        entities: ['dist/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migration/**/*{.ts,.js}'],
        cli: {
          migrationsDir: __dirname + '/migration/',
        },
        ssl: {
          rejectUnauthorized: false,
          ca: configService.get('CA_CERT_PATH'),
        },
        logging: configService.get('NODE_ENV') !== 'production' ? true : false,
      }),
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: configService.get<number>('HTTP_TIMEOUT', 10000),
        maxRedirects: configService.get<number>('HTTP_MAX_REDIRECTS', 5),
      }),
    }),
    UserModule,
    BusinessesModule,
    SubscriptionsModule,
    LocationModule,
    SocialmediaModule,
    BusinessHoursModule,
    DealModule,
    NotificationsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ClerkMiddleware).forRoutes('*');
  }
}
