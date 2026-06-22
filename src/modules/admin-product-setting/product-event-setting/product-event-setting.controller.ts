import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Language } from '@prisma/client';
import { ProductEventSettingService } from './product-event-setting.service';
import { ApiCommonResponse, CommonSetResponseDto } from '@common/dto/common-response.dto';
import { ApiPaginatedResponse, PaginatedResponseDto } from '@common/dto/pagination.dto';
import { LanguageReqDto, UpdateToggleReqDto } from '@common/dto/common-patch.dto';
import { SettingService } from '@src/core/setting/setting.service';
import { GetProductEventListReqDto } from './dto/get-product-event/query.dto';
import { GetProductEventDetailResDto, GetProductEventListResDto, GetProductEventTranslationResDto } from './dto/get-product-event/response.dto';
import { GetEventProductResDto } from './dto/get-product-event-products/response.dto';
import { SetProductEventReqDto } from './dto/set-product-event/request.dto';
import { PutProductEventReqDto, PutProductEventPublicTranslationReqDto, PutProductEventTranslationReqDto } from './dto/put-product-event/request.dto';
import { PatchProductEventOrderReqDto } from './dto/patch-product-event/request.dto';
import { SetEventProductsReqDto } from './dto/set-product-event-products/request.dto';
import { PutEventProductReqDto } from './dto/put-product-event-products/request.dto';
import { DeleteEventProductsReqDto } from './dto/delete-product-event-products/request.dto';
import { Public } from '@common/decorators/public.decorator';

@Public()
@ApiExtraModels(GetProductEventListResDto, GetProductEventDetailResDto, GetProductEventTranslationResDto, CommonSetResponseDto, GetEventProductResDto)
@ApiTags('H 시술|상품 설정 > 상품 설정 - 이벤트')
@Controller('/api/v1/product-event')
export class ProductEventSettingController {
  constructor(
    private readonly productEventSettingService: ProductEventSettingService,
    private readonly settingService: SettingService,
  ) { }

  // ────────── 이벤트 ──────────

  @Get('/list')
  @ApiOperation({ summary: '이벤트 목록 조회' })
  @ApiPaginatedResponse(GetProductEventListResDto, { status: 200 })
  async getProductEventList(@Query() dto: GetProductEventListReqDto, @Headers('lang') headerLang: string): Promise<PaginatedResponseDto<GetProductEventListResDto>> {
    return this.productEventSettingService.getProductEventList(dto, headerLang as Language);
  }

  @Get('/:id')
  @ApiOperation({ summary: '이벤트 상세 조회' })
  @ApiCommonResponse(GetProductEventDetailResDto, { isArray: false, status: 200 })
  async getProductEventDetail(@Param('id') id: number): Promise<GetProductEventDetailResDto> {
    return this.productEventSettingService.getProductEventDetail(id);
  }

  @Get('/:id/translation')
  @ApiOperation({ summary: '이벤트 번역 조회 (특정 언어)' })
  @ApiCommonResponse(GetProductEventTranslationResDto, { isArray: false, status: 200 })
  async getProductEventTranslation(@Param('id') id: number, @Query() dto: LanguageReqDto, @Headers('lang') headerLang: string): Promise<GetProductEventTranslationResDto> {
    return this.productEventSettingService.getProductEventTranslation(id, dto.language as Language, headerLang as Language);
  }

  @Post('/')
  @ApiOperation({ summary: '이벤트 등록' })
  @ApiCommonResponse(CommonSetResponseDto, { isArray: false, status: 200 })
  async setProductEvent(@Body() dto: SetProductEventReqDto): Promise<CommonSetResponseDto> {
    return this.productEventSettingService.setProductEvent(dto);
  }

  @Put('/:id')
  @ApiOperation({ summary: '이벤트 수정 (기준언어)' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update product event success' })
  async putProductEvent(@Param('id') id: number, @Body() dto: PutProductEventReqDto): Promise<string> {
    return this.productEventSettingService.putProductEvent(id, dto);
  }

  @Put('/:id/public-translation')
  @ApiOperation({ summary: '이벤트 공용언어 번역 수정' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update product event translation success' })
  async putProductEventPublicTranslation(@Param('id') id: number, @Body() dto: PutProductEventPublicTranslationReqDto): Promise<string> {
    return this.productEventSettingService.putProductEventPublicTranslation(id, dto);
  }

  @Put('/:id/translation')
  @ApiOperation({ summary: '이벤트 기타언어 번역 수정' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update product event translation success' })
  async putProductEventTranslation(@Param('id') id: number, @Body() dto: PutProductEventTranslationReqDto): Promise<string> {
    return this.productEventSettingService.putProductEventTranslation(id, dto);
  }

  @Delete('/:id')
  @ApiOperation({ summary: '이벤트 삭제' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'delete product event success' })
  async deleteProductEvent(@Param('id') id: number): Promise<string> {
    return this.productEventSettingService.deleteProductEvent(id);
  }

  @Patch('/:id/toggle')
  @ApiOperation({ summary: '이벤트 사용 여부 수정' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update product event toggle success' })
  async patchProductEventToggle(@Param('id') id: number, @Body() dto: UpdateToggleReqDto): Promise<string> {
    return this.productEventSettingService.patchProductEventToggle(id, dto);
  }

  @Patch('/order')
  @ApiOperation({ summary: '이벤트 순서 변경' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update product event order success' })
  async patchProductEventOrder(@Body() dto: PatchProductEventOrderReqDto): Promise<string> {
    return this.productEventSettingService.patchProductEventOrder(dto);
  }

  // ────────── 이벤트 상품 ──────────

  @Get('/:id/products')
  @ApiOperation({ summary: '이벤트 상품 목록 조회' })
  @ApiCommonResponse(GetEventProductResDto, { isArray: true, status: 200 })
  async getEventProductList(@Param('id') id: number, @Headers('lang') headerLang: string,): Promise<any[]> {
    return this.productEventSettingService.getEventProductList(id, headerLang as Language);
  }

  @Post('/:id/products')
  @ApiOperation({ summary: '이벤트 상품 추가' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'set event products success' })
  async setEventProducts(@Param('id') id: number, @Body() dto: SetEventProductsReqDto): Promise<string> {
    return this.productEventSettingService.setEventProducts(id, dto);
  }

  @Put('/:id/products')
  @ApiOperation({ summary: '이벤트 상품 일괄 수정 (가격/할인율/순서)' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update event product success' })
  async putEventProduct(@Param('id') id: number, @Body() dto: PutEventProductReqDto): Promise<string> {
    return this.productEventSettingService.putEventProduct(id, dto);
  }

  @Delete('/:id/products')
  @ApiOperation({ summary: '이벤트 상품 삭제 (복수)' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'delete event product success' })
  async deleteEventProduct(@Param('id') id: number, @Body() dto: DeleteEventProductsReqDto): Promise<string> {
    return this.productEventSettingService.deleteEventProduct(id, dto);
  }
}
