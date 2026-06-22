import { Module } from '@nestjs/common';
import { ProductSettingController } from './product-setting/product-setting.controller';
import { ProductSettingService } from './product-setting/product-setting.service';
import { ProductCategorySettingController } from './product-category-setting/product-category-setting.controller';
import { ProductCategorySettingService } from './product-category-setting/product-category-setting.service';
import { ProductEventSettingController } from './product-event-setting/product-event-setting.controller';
import { ProductEventSettingService } from './product-event-setting/product-event-setting.service';

@Module({
  imports: [],
  controllers: [
    ProductSettingController,
    ProductCategorySettingController,
    ProductEventSettingController,
  ],
  providers: [
    ProductSettingService,
    ProductCategorySettingService,
    ProductEventSettingService,
  ],
  exports: [],
})
export class AdminProductSettingModule { }
