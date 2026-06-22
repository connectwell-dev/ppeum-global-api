import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiCommonResponse } from '@common/dto/common-response.dto';
import { ImageCategorySettingService } from './image-category-setting.service';
import { SetImageCategoryReqDto } from './dto/set-image-category/request.dto';
import { PutImageCategoryReqDto } from './dto/put-image-category/request.dto';
import { GetImageCategoryDetailResDto, GetImageCategoryListResDto } from './dto/get-image-category/response.dto';
import { Public } from '@common/decorators/public.decorator';
import { AdminPermission } from '@common/decorators/permission.decorator';

@Public()
@AdminPermission('generalSetting')
@ApiExtraModels(GetImageCategoryListResDto, GetImageCategoryDetailResDto)
@ApiTags('H 기타 설정 > 이미지 설정 - 이미지 분류')
@Controller('/api/v1/general/image-category')
export class ImageCategorySettingController {
  constructor(private readonly imageCategorySettingService: ImageCategorySettingService) { }

  @Get('/list')
  @ApiOperation({ summary: '이미지 분류 목록 조회' })
  @ApiCommonResponse(GetImageCategoryListResDto, { isArray: true, status: 200 })
  async getImageCategoryList() {
    return this.imageCategorySettingService.getImageCategoryList();
  }
}
