import { Global, Module } from '@nestjs/common';
import { SettingService } from './setting.service';

@Global()
@Module({
  providers: [SettingService],
  exports: [SettingService],
})
export class SettingModule { }
