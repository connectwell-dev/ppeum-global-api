import { Module } from '@nestjs/common';
import { AdminPolicySettingController } from './admin-policy-setting.controller';
import { AdminPolicySettingService } from './admin-policy-setting.service';

@Module({
  imports: [],
  controllers: [AdminPolicySettingController],
  providers: [AdminPolicySettingService],
  exports: [],
})
export class AdminPolicySettingModule { }
