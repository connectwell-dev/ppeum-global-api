import { Module } from '@nestjs/common';
import { S3Module } from '@src/core/s3/s3.module';
import { BasicPopupSettingController } from './basic-popup-setting/basic-popup-setting.controller';
import { BasicPopupSettingService } from './basic-popup-setting/basic-popup-setting.service';
@Module({
  imports: [S3Module],
  controllers: [BasicPopupSettingController],
  providers: [BasicPopupSettingService],
  exports: [],
})
export class AdminPopupSettingModule { }
