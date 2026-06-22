import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminAuthController } from './admin-auth/admin-auth.controller';
import { AdminAuthService } from './admin-auth/admin-auth.service';
import { UserAuthController } from './user-auth/user-auth.controller';
import { UserAuthService } from './user-auth/user-auth.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AdminAuthController, UserAuthController],
  providers: [AdminAuthService, UserAuthService],
  exports: [JwtModule],
})
export class AuthModule { }
