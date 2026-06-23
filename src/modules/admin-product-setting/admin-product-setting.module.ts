import { Module } from '@nestjs/common';
import { ProductSettingController } from './product-setting/product-setting.controller';
import { ProductSettingService } from './product-setting/product-setting.service';
import { ProductUploadTemplateService } from './product-setting/product-upload-template.service';
import { ProductUploadService } from './product-setting/product-upload.service';
import { ProductCategorySettingController } from './product-category-setting/product-category-setting.controller';
import { ProductCategorySettingService } from './product-category-setting/product-category-setting.service';
import { ProductGroupSettingController } from './product-group-setting/product-group-setting.controller';
import { ProductGroupSettingService } from './product-group-setting/product-group-setting.service';

@Module({
  imports: [],
  controllers: [
    ProductSettingController,
    ProductCategorySettingController,
    ProductGroupSettingController,
  ],
  providers: [
    ProductSettingService,
    ProductUploadTemplateService,
    ProductUploadService,
    ProductCategorySettingService,
    ProductGroupSettingService,
  ],
  exports: [],
})
export class AdminProductSettingModule { }
