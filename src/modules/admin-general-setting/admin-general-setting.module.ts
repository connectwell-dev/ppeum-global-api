import { Module } from '@nestjs/common';
import { S3Module } from '@src/core/s3/s3.module';
import { ImageCategorySettingController } from './image-category-setting/image-category-setting.controller';
import { ImageCategorySettingService } from './image-category-setting/image-category-setting.service';
import { ImageSettingController } from './image-setting/image-setting.controller';
import { ImageSettingService } from './image-setting/image-setting.service';

@Module({
  imports: [S3Module],
  controllers: [ImageCategorySettingController, ImageSettingController],
  providers: [ImageCategorySettingService, ImageSettingService],
  exports: [ImageSettingService],
})
export class AdminGeneralSettingModule { }
