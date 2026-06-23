import { Controller, Get, Param, ParseIntPipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { ApiCommonResponse } from '@common/dto/common-response.dto';
import { Public } from '@common/decorators/public.decorator';
import { AdminPermission } from '@common/decorators/permission.decorator';
import { ImageFileRequiredPipe } from '@modules/admin-general-setting/image-setting/pipes/image-file.pipe';
import { BasicPopupSettingService } from './basic-popup-setting.service';
import { GetBasicPopupListResDto, GetBasicPopupDetailResDto } from './dto/get-basic-popup/response.dto';

@Public()
@ApiExtraModels(GetBasicPopupListResDto, GetBasicPopupDetailResDto)
@ApiTags('H 팝업 설정 > 기본 팝업')
@Controller('/api/v1/popup-setting/basic')
export class BasicPopupSettingController {
  constructor(private readonly basicPopupSettingService: BasicPopupSettingService) { }

  @Get('/list')
  @ApiOperation({ summary: '기본 팝업 리스트 조회' })
  @ApiCommonResponse(GetBasicPopupListResDto, { isArray: true, status: 200 })
  async getBasicPopupList() {
    return await this.basicPopupSettingService.getBasicPopupList();
  }

  @Get('/:id')
  @ApiOperation({ summary: '기본 팝업 상세 조회' })
  @ApiCommonResponse(GetBasicPopupDetailResDto, { status: 200 })
  async getBasicPopupDetail(@Param('id', ParseIntPipe) id: number) {
    return await this.basicPopupSettingService.getBasicPopupDetail(id);
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
}
