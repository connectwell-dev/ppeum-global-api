import { Body, Controller, Delete, Get, Headers, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Language } from '@prisma/client';
import { ApiCommonResponse, CommonSetResponseDto } from '@common/dto/common-response.dto';
import { ApiPaginatedResponse, PaginatedResponseDto } from '@common/dto/pagination.dto';
import { OperationInfoSettingService } from './operation-info-setting.service';
import { GetOperationInfoListReqDto } from './dto/get-operation-info/query.dto';
import { GetOperationInfoDetailResDto, GetOperationInfoListResDto } from './dto/get-operation-info/response.dto';
import { GetOperationInfoOperationListResDto } from './dto/get-operation-info-operation/response.dto';
import { SetOperationInfoReqDto } from './dto/set-operation-info/request.dto';
import { PutOperationInfoPublicTranslationReqDto, PutOperationInfoReqDto, PutOperationInfoTranslationReqDto } from './dto/put-operation-info/request.dto';
import { LanguageReqDto } from '@common/dto/common-patch.dto';
import { Public } from '@common/decorators/public.decorator';
import { AdminPermission } from '@common/decorators/permission.decorator';

@AdminPermission('sellMenuSetting')
@ApiExtraModels(GetOperationInfoListResDto, GetOperationInfoDetailResDto, CommonSetResponseDto, GetOperationInfoOperationListResDto)
@ApiTags('H 시술|상품 설정 > 시술설정 - 시술 설명')
@Controller('/api/v1/operation-info')
@Public()
export class OperationInfoSettingController {
  constructor(private readonly operationInfoSettingService: OperationInfoSettingService) { }

  @Get('/list')
  @ApiOperation({ summary: '시술 설명 리스트 조회' })
  @ApiPaginatedResponse(GetOperationInfoListResDto, { status: 200 })
  async getOperationInfoList(@Query() dto: GetOperationInfoListReqDto, @Headers('lang') headerLang: string): Promise<PaginatedResponseDto<GetOperationInfoListResDto>> {
    return await this.operationInfoSettingService.getOperationInfoList(dto, headerLang as Language);
  }

  @Get('/:id')
  @ApiOperation({ summary: '시술 설명 상세 조회' })
  @ApiCommonResponse(GetOperationInfoDetailResDto, { isArray: false, status: 200 })
  async getOperationInfoDetail(@Param('id', ParseIntPipe) id: number, @Query() dto: LanguageReqDto, @Headers('lang') headerLang: string): Promise<CommonSetResponseDto> {
    return await this.operationInfoSettingService.getOperationInfoDetail(id, dto.language as Language, headerLang as Language);
  }

  @Get('/:id/operation-list')
  @ApiOperation({ summary: '시술 설명 연결된 상품 목록 조회' })
  @ApiCommonResponse(GetOperationInfoOperationListResDto, { isArray: true, status: 200 })
  async getOperationInfoOperationList(@Param('id', ParseIntPipe) id: number, @Headers('lang') headerLang: string): Promise<GetOperationInfoOperationListResDto[]> {
    return await this.operationInfoSettingService.getOperationInfoOperationList(id, headerLang as Language);
  }

  @Post('/')
  @ApiOperation({ summary: '시술 설명 등록' })
  @ApiCommonResponse(CommonSetResponseDto, { isArray: false, status: 200 })
  async setOperationInfo(@Body() dto: SetOperationInfoReqDto): Promise<any> {
    return await this.operationInfoSettingService.setOperationInfo(dto);
  }

  @Put('/:id')
  @ApiOperation({ summary: '시술 설명 수정 (기준언어)' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update operation info success' })
  async putOperationInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PutOperationInfoReqDto,
  ): Promise<string> {
    return await this.operationInfoSettingService.putOperationInfo(id, dto);
  }

  @Put('/:id/public-translation')
  @ApiOperation({ summary: '시술 설명 번역 수정 (공용언어)' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update operation info public translation success' })
  async putOperationInfoPublicTranslation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PutOperationInfoPublicTranslationReqDto,
  ): Promise<string> {
    return await this.operationInfoSettingService.putOperationInfoPublicTranslation(id, dto);
  }

  @Put('/:id/translation')
  @ApiOperation({ summary: '시술 설명 번역 수정 (기타언어)' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update operation info translation success' })
  async putOperationInfoTranslation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PutOperationInfoTranslationReqDto,
  ): Promise<string> {
    return await this.operationInfoSettingService.putOperationInfoTranslation(id, dto);
  }

  @Delete('/:id')
  @ApiOperation({ summary: '시술 설명 삭제' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'delete operation info success' })
  async deleteOperationInfo(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return await this.operationInfoSettingService.deleteOperationInfo(id);
  }
}
