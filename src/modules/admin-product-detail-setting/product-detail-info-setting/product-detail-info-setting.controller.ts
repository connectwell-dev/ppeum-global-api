import { Body, Controller, Delete, Get, Headers, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Language } from '@prisma/client';
import { ApiCommonResponse, CommonSetResponseDto } from '@common/dto/common-response.dto';
import { ApiPaginatedResponse, PaginatedResponseDto } from '@common/dto/pagination.dto';
import { ProductDetailInfoSettingService } from './product-detail-info-setting.service';
import { GetProductDetailInfoListReqDto } from './dto/get-product-detail-info/query.dto';
import { GetProductDetailInfoDetailResDto, GetProductDetailInfoListResDto } from './dto/get-product-detail-info/response.dto';
import { GetProductDetailInfoOperationListResDto } from './dto/get-product-detail-info-operation/response.dto';
import { SetProductDetailInfoReqDto } from './dto/set-product-detail-info/request.dto';
import { PutProductDetailInfoPublicTranslationReqDto, PutProductDetailInfoReqDto, PutProductDetailInfoTranslationReqDto } from './dto/put-product-detail-info/request.dto';
import { LanguageReqDto } from '@common/dto/common-patch.dto';
import { Public } from '@common/decorators/public.decorator';
import { AdminPermission } from '@common/decorators/permission.decorator';

@AdminPermission('sellMenuSetting')
@ApiExtraModels(GetProductDetailInfoListResDto, GetProductDetailInfoDetailResDto, CommonSetResponseDto, GetProductDetailInfoOperationListResDto)
@ApiTags('H 상세페이지|상품 설정 > 상세페이지설정 - 상세페이지 설명')
@Controller('/api/v1/product-detail-info')
@Public()
export class ProductDetailInfoSettingController {
  constructor(private readonly productDetailInfoSettingService: ProductDetailInfoSettingService) { }

  @Get('/list')
  @ApiOperation({ summary: '상세페이지 설명 리스트 조회' })
  @ApiPaginatedResponse(GetProductDetailInfoListResDto, { status: 200 })
  async getProductDetailInfoList(@Query() dto: GetProductDetailInfoListReqDto, @Headers('lang') headerLang: string): Promise<PaginatedResponseDto<GetProductDetailInfoListResDto>> {
    return await this.productDetailInfoSettingService.getProductDetailInfoList(dto, headerLang as Language);
  }

  @Get('/:id')
  @ApiOperation({ summary: '상세페이지 설명 상세 조회' })
  @ApiCommonResponse(GetProductDetailInfoDetailResDto, { isArray: false, status: 200 })
  async getProductDetailInfoDetail(@Param('id', ParseIntPipe) id: number, @Query() dto: LanguageReqDto, @Headers('lang') headerLang: string): Promise<CommonSetResponseDto> {
    return await this.productDetailInfoSettingService.getProductDetailInfoDetail(id, dto.language as Language, headerLang as Language);
  }

  @Get('/:id/operation-list')
  @ApiOperation({ summary: '상세페이지 설명 연결된 상품 목록 조회' })
  @ApiCommonResponse(GetProductDetailInfoOperationListResDto, { isArray: true, status: 200 })
  async getProductDetailInfoOperationList(@Param('id', ParseIntPipe) id: number, @Headers('lang') headerLang: string): Promise<GetProductDetailInfoOperationListResDto[]> {
    return await this.productDetailInfoSettingService.getProductDetailInfoOperationList(id, headerLang as Language);
  }

  @Post('/')
  @ApiOperation({ summary: '상세페이지 설명 등록' })
  @ApiCommonResponse(CommonSetResponseDto, { isArray: false, status: 200 })
  async setProductDetailInfo(@Body() dto: SetProductDetailInfoReqDto): Promise<any> {
    return await this.productDetailInfoSettingService.setProductDetailInfo(dto);
  }

  @Put('/:id')
  @ApiOperation({ summary: '상세페이지 설명 수정 (기준언어)' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update product detail info success' })
  async putProductDetailInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PutProductDetailInfoReqDto,
  ): Promise<string> {
    return await this.productDetailInfoSettingService.putProductDetailInfo(id, dto);
  }

  @Put('/:id/public-translation')
  @ApiOperation({ summary: '상세페이지 설명 번역 수정 (공용언어)' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update product detail info public translation success' })
  async putProductDetailInfoPublicTranslation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PutProductDetailInfoPublicTranslationReqDto,
  ): Promise<string> {
    return await this.productDetailInfoSettingService.putProductDetailInfoPublicTranslation(id, dto);
  }

  @Put('/:id/translation')
  @ApiOperation({ summary: '상세페이지 설명 번역 수정 (기타언어)' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update product detail info translation success' })
  async putProductDetailInfoTranslation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PutProductDetailInfoTranslationReqDto,
  ): Promise<string> {
    return await this.productDetailInfoSettingService.putProductDetailInfoTranslation(id, dto);
  }

  @Delete('/:id')
  @ApiOperation({ summary: '상세페이지 설명 삭제' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'delete product detail info success' })
  async deleteProductDetailInfo(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return await this.productDetailInfoSettingService.deleteProductDetailInfo(id);
  }
}
