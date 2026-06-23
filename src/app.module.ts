import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from './core/guards/jwt-auth.guard';
import { PermissionGuard } from './core/guards/permission.guard';
import { PrismaModule } from './core/prisma/prisma.module';
import { HelpersModule } from './core/helpers/helpers.module';
import { SettingModule } from './core/setting/setting.module';
import { RedisModule } from './core/redis/redis.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { AuthModule } from './modules/auth/auth.module';
import { AdminGeneralSettingModule } from './modules/admin-general-setting/admin-general-setting.module';
import { AdminProductSettingModule } from './modules/admin-product-setting/admin-product-setting.module';
import { AdminOperationSettingModule } from './modules/admin-operation-setting/admin-operation-setting.module';
import { AdminPolicySettingModule } from './modules/admin-policy-setting/admin-policy-setting.module';
import { AdminPopupSettingModule } from './modules/admin-popup-setting/admin-popup-setting.module';

const nodeEnv = process.env.NODE_ENV || 'development';
const envFilePath = `.env.${nodeEnv}`;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envFilePath,
      expandVariables: true,
      cache: true,
    }),
    PrismaModule,
    HelpersModule,
    SettingModule,
    RedisModule,
    AuthModule,
    AdminGeneralSettingModule,
    AdminProductSettingModule,
    AdminOperationSettingModule,
    AdminPolicySettingModule,
    AdminPopupSettingModule
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
  ],
})
export class AppModule { }
