import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { HttpModule } from '@nestjs/axios';
// import { ClerkMiddleware } from './auth/clerk.middleware';
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
import { InvitationModule } from './invitation/invitation.module';
import { ClerkModule } from './clerk/clerk.module';
import { SessionModule } from './session/session.module';
import { ClerkMiddleware } from './auth/clerk.middleware';

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
      // envFilePath:
      //   process.env.NODE_ENV === 'production' ? '.env' : '.env.development',
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
        url: configService.get('DO_DATABASE_URL'),
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
    InvitationModule,
    ClerkModule,
    SessionModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ClerkMiddleware)
      .exclude(
        // Invitations routes
        { path: 'invitations', method: RequestMethod.GET },
        { path: 'invitations', method: RequestMethod.POST },
        { path: 'invitations/*', method: RequestMethod.GET },
        { path: 'invitations/*', method: RequestMethod.POST },
        { path: 'invitations/*', method: RequestMethod.PUT },
        { path: 'invitations/*', method: RequestMethod.DELETE },

        // Businesses routes
        { path: 'businesses', method: RequestMethod.GET },
        { path: 'businesses', method: RequestMethod.POST },
        { path: 'businesses/*', method: RequestMethod.GET },
        { path: 'businesses/*', method: RequestMethod.PUT },
        { path: 'businesses/*', method: RequestMethod.DELETE },

        // Existing business-images routes
        { path: 'business-images/*', method: RequestMethod.GET },
        { path: 'business-images/*', method: RequestMethod.POST },
        { path: 'business-images/upload/*', method: RequestMethod.GET },
        { path: 'business-images/upload/*', method: RequestMethod.POST }
      )
      .forRoutes('*');
  }
}
