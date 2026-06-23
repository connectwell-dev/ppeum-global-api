import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { ApiCommonResponse } from '@common/dto/common-response.dto';
import { Public } from '@common/decorators/public.decorator';
import { ImageFileRequiredPipe, ImageFileOptionalPipe } from '@modules/admin-general-setting/image-setting/pipes/image-file.pipe';
import { MainPopupSettingService } from './main-popup-setting.service';
import { GetMainPopupCategoryListResDto, GetMainPopupCategoryDetailResDto } from './dto/get-main-popup/response.dto';
import { PutMainPopupReqDto } from './dto/put-main-popup/request.dto';
import { ReorderMainPopupReqDto } from './dto/reorder-main-popup/request.dto';

@Public()
@ApiExtraModels(GetMainPopupCategoryListResDto, GetMainPopupCategoryDetailResDto)
@ApiTags('H 팝업 설정 > 메인 팝업')
@Controller('/api/v1/popup-setting/main')
export class MainPopupSettingController {
  constructor(private readonly mainPopupSettingService: MainPopupSettingService) { }

  @Get('/list')
  @ApiOperation({ summary: '메인 팝업 카테고리 리스트 조회' })
  @ApiCommonResponse(GetMainPopupCategoryListResDto, { status: 200 })
  async getMainPopupCategoryList() {
    return await this.mainPopupSettingService.getMainPopupCategoryList();
  }

  @Get('/category/:id')
  @ApiOperation({ summary: '메인 팝업 카테고리 상세 조회' })
  @ApiCommonResponse(GetMainPopupCategoryDetailResDto, { status: 200 })
  async getMainPopupCategoryDetail(@Param('id', ParseIntPipe) id: number) {
    return await this.mainPopupSettingService.getMainPopupCategoryDetail(id);
  }

  @Post('/:id/image')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiOperation({ summary: '메인 팝업 이미지 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  async setMainPopupImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(new ImageFileRequiredPipe()) file: Express.Multer.File,
  ) {
    return await this.mainPopupSettingService.setMainPopupImage(id, file);
  }

  @Patch('/reorder')
  @ApiOperation({ summary: '메인 팝업 순서 변경' })
  async reorderMainPopup(@Body() dto: ReorderMainPopupReqDto) {
    return await this.mainPopupSettingService.reorderMainPopup(dto.items);
  }

  @Put('/:id')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiOperation({ summary: '메인 팝업 수정' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: PutMainPopupReqDto })
  async putMainPopup(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PutMainPopupReqDto,
    @UploadedFile(new ImageFileOptionalPipe()) file?: Express.Multer.File,
  ) {
    return await this.mainPopupSettingService.putMainPopup(id, dto, file);
  }
}
