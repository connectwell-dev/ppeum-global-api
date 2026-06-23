import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { ApiCommonResponse } from '@common/dto/common-response.dto';
import { Public } from '@common/decorators/public.decorator';
import { AdminPermission } from '@common/decorators/permission.decorator';
import { ImageFileRequiredPipe, ImageFileOptionalPipe } from '@modules/admin-general-setting/image-setting/pipes/image-file.pipe';
import { BasicPopupSettingService } from './basic-popup-setting.service';
import { GetBasicPopupCategoryListResDto, GetBasicPopupCategoryDetailResDto } from './dto/get-basic-popup/response.dto';
import { PutBasicPopupReqDto } from './dto/put-basic-popup/request.dto';

@Public()
@ApiExtraModels(GetBasicPopupCategoryListResDto, GetBasicPopupCategoryDetailResDto)
@ApiTags('H 팝업 설정 > 기본 팝업')
@Controller('/api/v1/popup-setting/basic')
export class BasicPopupSettingController {
  constructor(private readonly basicPopupSettingService: BasicPopupSettingService) { }

  @Get('/list')
  @ApiOperation({ summary: '기본 팝업 카테고리 리스트 조회' })
  @ApiCommonResponse(GetBasicPopupCategoryListResDto, { status: 200 })
  async getBasicPopupCategoryList() {
    return await this.basicPopupSettingService.getBasicPopupCategoryList();
  }

  @Get('/category/:id')
  @ApiOperation({ summary: '기본 팝업 카테고리 상세 조회' })
  @ApiCommonResponse(GetBasicPopupCategoryDetailResDto, { status: 200 })
  async getBasicPopupCategoryDetail(@Param('id', ParseIntPipe) id: number) {
    return await this.basicPopupSettingService.getBasicPopupCategoryDetail(id);
  }

  @Post('/:id/image')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiOperation({ summary: '기본 팝업 이미지 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  async setBasicPopupImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(new ImageFileRequiredPipe()) file: Express.Multer.File,
  ) {
    return await this.basicPopupSettingService.setBasicPopupImage(id, file);
  }

  @Put('/:id')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiOperation({ summary: '기본 팝업 수정' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: PutBasicPopupReqDto })
  async putBasicPopup(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PutBasicPopupReqDto,
    @UploadedFile(new ImageFileOptionalPipe()) file?: Express.Multer.File,
  ) {
    return await this.basicPopupSettingService.putBasicPopup(id, dto, file);
  }
}
