import { Module } from '@nestjs/common';
import { OperationInfoSettingController } from './operation-info-setting/operation-info-setting.controller';
import { OperationInfoSettingService } from './operation-info-setting/operation-info-setting.service';

@Module({
  imports: [],
  controllers: [OperationInfoSettingController],
  providers: [OperationInfoSettingService],
  exports: [],
})
export class AdminOperationSettingModule { }
