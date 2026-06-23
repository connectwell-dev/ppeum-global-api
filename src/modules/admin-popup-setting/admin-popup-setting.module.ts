import { Module } from '@nestjs/common';
import { BasicPopupSettingController } from './basic-popup-setting/basic-popup-setting.controller';
import { BasicPopupSettingService } from './basic-popup-setting/basic-popup-setting.service';
@Module({
  imports: [],
  controllers: [BasicPopupSettingController],
  providers: [BasicPopupSettingService],
  exports: [],
})
export class AdminPopupSettingModule { }
