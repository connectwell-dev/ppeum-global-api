import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Language } from '@prisma/client';
import { ProductCategorySettingService } from './product-category-setting.service';
import { ApiCommonResponse, CommonSetResponseDto } from '@common/dto/common-response.dto';
import { ApiPaginatedResponse, PaginatedResponseDto } from '@common/dto/pagination.dto';
import { LanguageReqDto, UpdateToggleReqDto } from '@common/dto/common-patch.dto';
import { SettingService } from '@src/core/setting/setting.service';
import { GetProductCategoryListReqDto } from './dto/get-product-category/query.dto';
import { GetProductCategoryDetailResDto, GetProductCategoryListResDto, GetProductCategoryTranslationResDto } from './dto/get-product-category/response.dto';
import { GetCategoryProductResDto } from './dto/get-product-category-products/response.dto';
import { SetProductCategoryReqDto } from './dto/set-product-category/request.dto';
import { PutProductCategoryReqDto, PutProductCategoryPublicTranslationReqDto, PutProductCategoryTranslationReqDto } from './dto/put-product-category/request.dto';
import { PatchProductCategoryOrderReqDto } from './dto/patch-product-category/request.dto';
import { SetCategoryProductsReqDto } from './dto/set-product-category-products/request.dto';
import { PutCategoryProductReqDto } from './dto/put-product-category-products/request.dto';
import { DeleteCategoryProductsReqDto } from './dto/delete-product-category-products/request.dto';
import { Public } from '@common/decorators/public.decorator';

@Public()
@ApiExtraModels(GetProductCategoryListResDto, GetProductCategoryDetailResDto, GetProductCategoryTranslationResDto, CommonSetResponseDto, GetCategoryProductResDto)
@ApiTags('H 시술|상품 설정 > 상품 설정 - 카테고리')
@Controller('/api/v1/product-category')
export class ProductCategorySettingController {
  constructor(
    private readonly productCategorySettingService: ProductCategorySettingService,
    private readonly settingService: SettingService,
  ) { }

  // ────────── 카테고리 ──────────

  @Get('/list')
  @ApiOperation({ summary: '카테고리 목록 조회' })
  @ApiPaginatedResponse(GetProductCategoryListResDto, { status: 200 })
  async getProductCategoryList(@Query() dto: GetProductCategoryListReqDto, @Headers('lang') headerLang: string): Promise<PaginatedResponseDto<GetProductCategoryListResDto>> {
    return this.productCategorySettingService.getProductCategoryList(dto, headerLang as Language);
  }

  @Get('/:id')
  @ApiOperation({ summary: '카테고리 상세 조회' })
  @ApiCommonResponse(GetProductCategoryDetailResDto, { isArray: false, status: 200 })
  async getProductCategoryDetail(@Param('id') id: number): Promise<GetProductCategoryDetailResDto> {
    return this.productCategorySettingService.getProductCategoryDetail(id);
  }

  @Get('/:id/translation')
  @ApiOperation({ summary: '카테고리 번역 조회 (특정 언어)' })
  @ApiCommonResponse(GetProductCategoryTranslationResDto, { isArray: false, status: 200 })
  async getProductCategoryTranslation(@Param('id') id: number, @Query() dto: LanguageReqDto, @Headers('lang') headerLang: string): Promise<GetProductCategoryTranslationResDto> {
    return this.productCategorySettingService.getProductCategoryTranslation(id, dto.language as Language, headerLang as Language);
  }

  @Post('/')
  @ApiOperation({ summary: '카테고리 등록' })
  @ApiCommonResponse(CommonSetResponseDto, { isArray: false, status: 200 })
  async setProductCategory(@Body() dto: SetProductCategoryReqDto): Promise<CommonSetResponseDto> {
    return this.productCategorySettingService.setProductCategory(dto);
  }

  @Put('/:id')
  @ApiOperation({ summary: '카테고리 수정 (기준언어)' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update product category success' })
  async putProductCategory(@Param('id') id: number, @Body() dto: PutProductCategoryReqDto): Promise<string> {
    return this.productCategorySettingService.putProductCategory(id, dto);
  }

  @Put('/:id/public-translation')
  @ApiOperation({ summary: '카테고리 공용언어 번역 수정' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update product category translation success' })
  async putProductCategoryPublicTranslation(@Param('id') id: number, @Body() dto: PutProductCategoryPublicTranslationReqDto): Promise<string> {
    return this.productCategorySettingService.putProductCategoryPublicTranslation(id, dto);
  }

  @Put('/:id/translation')
  @ApiOperation({ summary: '카테고리 기타언어 번역 수정' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update product category translation success' })
  async putProductCategoryTranslation(@Param('id') id: number, @Body() dto: PutProductCategoryTranslationReqDto): Promise<string> {
    return this.productCategorySettingService.putProductCategoryTranslation(id, dto);
  }

  @Delete('/:id')
  @ApiOperation({ summary: '카테고리 삭제' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'delete product category success' })
  async deleteProductCategory(@Param('id') id: number): Promise<string> {
    return this.productCategorySettingService.deleteProductCategory(id);
  }

  @Patch('/:id/toggle')
  @ApiOperation({ summary: '카테고리 사용 여부 수정' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update product category toggle success' })
  async patchProductCategoryToggle(@Param('id') id: number, @Body() dto: UpdateToggleReqDto): Promise<string> {
    return this.productCategorySettingService.patchProductCategoryToggle(id, dto);
  }

  @Patch('/order')
  @ApiOperation({ summary: '카테고리 순서 변경' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update product category order success' })
  async patchProductCategoryOrder(@Body() dto: PatchProductCategoryOrderReqDto): Promise<string> {
    return this.productCategorySettingService.patchProductCategoryOrder(dto);
  }

  // ────────── 카테고리 상품 ──────────

  @Get('/:id/products')
  @ApiOperation({ summary: '카테고리 상품 목록 조회' })
  @ApiCommonResponse(GetCategoryProductResDto, { isArray: true, status: 200 })
  async getCategoryProductList(@Param('id') id: number, @Headers('lang') headerLang: string,): Promise<any[]> {
    return this.productCategorySettingService.getCategoryProductList(id, headerLang as Language);
  }

  @Post('/:id/products')
  @ApiOperation({ summary: '카테고리 상품 추가' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'set category products success' })
  async setCategoryProducts(@Param('id') id: number, @Body() dto: SetCategoryProductsReqDto): Promise<string> {
    return this.productCategorySettingService.setCategoryProducts(id, dto);
  }

  @Put('/:id/products')
  @ApiOperation({ summary: '카테고리 상품 일괄 수정 (가격/할인율/순서)' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update category product success' })
  async putCategoryProduct(@Param('id') id: number, @Body() dto: PutCategoryProductReqDto): Promise<string> {
    return this.productCategorySettingService.putCategoryProduct(id, dto);
  }

  @Delete('/:id/products')
  @ApiOperation({ summary: '카테고리 상품 삭제 (복수)' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'delete category product success' })
  async deleteCategoryProduct(@Param('id') id: number, @Body() dto: DeleteCategoryProductsReqDto): Promise<string> {
    return this.productCategorySettingService.deleteCategoryProduct(id, dto);
  }
}
