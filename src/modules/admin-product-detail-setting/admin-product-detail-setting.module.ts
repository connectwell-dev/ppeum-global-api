import { Module } from '@nestjs/common';
import { ProductDetailInfoSettingController } from './product-detail-info-setting/product-detail-info-setting.controller';
import { ProductDetailInfoSettingService } from './product-detail-info-setting/product-detail-info-setting.service';

@Module({
  imports: [],
  controllers: [ProductDetailInfoSettingController],
  providers: [ProductDetailInfoSettingService],
  exports: [],
})
export class AdminProductDetailSettingModule { }
