import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBody, ApiConsumes, ApiExtraModels, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiCommonResponse, CommonSetResponseDto } from '@common/dto/common-response.dto';
import { ApiPaginatedResponse } from '@common/dto/pagination.dto';
import { ImageSettingService } from './image-setting.service';
import { GetImageListQueryDto } from './dto/get-image/query.dto';
import { GetImageDetailResDto, GetImageListResDto } from './dto/get-image/response.dto';
import { SetImageReqDto } from './dto/set-image/request.dto';
import { PutImageReqDto } from './dto/put-image/request.dto';
import { ImageFileOptionalPipe, ImageFileRequiredPipe } from './pipes/image-file.pipe';
import { Public } from '@common/decorators/public.decorator';
import { AdminPermission } from '@common/decorators/permission.decorator';

@Public()
@AdminPermission('generalSetting')
@ApiExtraModels(GetImageListResDto, GetImageDetailResDto, CommonSetResponseDto)
@ApiTags('H 기타 설정 > 이미지 설정 - 이미지')
@Controller('/api/v1/general/image')
export class ImageSettingController {
  constructor(private readonly imageSettingService: ImageSettingService) { }

  @Get('/list')
  @ApiOperation({ summary: '이미지 목록 조회' })
  @ApiPaginatedResponse(GetImageListResDto)
  async getImageList(@Query() query: GetImageListQueryDto) {
    return this.imageSettingService.getImageList(query);
  }

  @Get('/:code')
  @ApiParam({ name: 'code', type: String, description: '이미지 code' })
  @ApiOperation({ summary: '이미지 상세 조회' })
  @ApiCommonResponse(GetImageDetailResDto, { isArray: false, status: 200 })
  async getImageDetail(@Param('code') code: string) {
    return this.imageSettingService.getImageDetail(code);
  }

  @Post('/')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiOperation({ summary: '이미지 등록' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: SetImageReqDto })
  @ApiCommonResponse(CommonSetResponseDto, { isArray: false, status: 201 })
  async setImage(
    @UploadedFile(new ImageFileRequiredPipe()) file: Express.Multer.File,
    @Body() dto: SetImageReqDto,
  ) {
    return this.imageSettingService.setImage(file, dto);
  }

  @Put('/:code')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiParam({ name: 'code', type: String, description: '이미지 code' })
  @ApiOperation({ summary: '이미지 수정 (파일 미전송 시 기존 이미지 유지)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: PutImageReqDto })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update image success' })
  async putImage(
    @Param('code') code: string,
    @UploadedFile(new ImageFileOptionalPipe()) file: Express.Multer.File | undefined,
    @Body() dto: PutImageReqDto,
  ) {
    return this.imageSettingService.putImage(code, file, dto);
  }

  @Delete('/:code')
  @ApiParam({ name: 'code', type: String, description: '이미지 code' })
  @ApiOperation({ summary: '이미지 삭제' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'delete image success' })
  async deleteImage(@Param('code') code: string) {
    return this.imageSettingService.deleteImage(code);
  }
}
