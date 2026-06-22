import { Controller, Get, Post, Put, Patch, Delete, Body, Param, ParseIntPipe, Headers } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductCategorySettingService } from './product-category-setting.service';
import { ApiCommonResponse, CommonSetResponseDto } from '@common/dto/common-response.dto';
import { SetProductCategoryMainReqDto, SetProductCategorySubReqDto } from './dto/set-product-category/request.dto';
import { PatchProductCategoryStatusReqDto } from './dto/patch-product-category/request.dto';
import { GetProductCategoryProductListResDto } from './dto/get-product-category-product/response.dto';
import { Language } from '@prisma/client';
import {
  GetProductCategoryMainListResDto,
  GetProductCategorySubListResDto,
} from './dto/get-product-category/response.dto';
import { Public } from '@common/decorators/public.decorator';

@Public()
@ApiExtraModels(GetProductCategoryMainListResDto, GetProductCategorySubListResDto, CommonSetResponseDto, GetProductCategoryProductListResDto)
@ApiTags('H 시술|상품 설정 > 상품 설정 - 상품 분류')
@Controller('/api/v1/product-category')
export class ProductCategorySettingController {
  constructor(private readonly productCategorySettingService: ProductCategorySettingService) { }

  // ────────── 대분류 ──────────

  @Get('/m/list')
  @ApiOperation({ summary: '대분류 목록 조회' })
  @ApiCommonResponse(GetProductCategoryMainListResDto, { isArray: true, status: 200 })
  async getProductCategoryMainList(@Headers('lang') headerLang: string): Promise<GetProductCategoryMainListResDto[]> {
    return this.productCategorySettingService.getProductCategoryMainList(headerLang as Language);
  }

  @Get('/m/:id')
  @ApiOperation({ summary: '대분류 상세 조회' })
  @ApiCommonResponse(GetProductCategoryMainListResDto, { isArray: false, status: 200 })
  async getProductCategoryMainDetail(@Param('id', ParseIntPipe) id: number): Promise<GetProductCategoryMainListResDto> {
    return this.productCategorySettingService.getProductCategoryMainDetail(id);
  }

  @Post('/m')
  @ApiOperation({ summary: '대분류 추가' })
  @ApiCommonResponse(CommonSetResponseDto, { isArray: false, status: 200 })
  async setProductCategoryMain(@Body() dto: SetProductCategoryMainReqDto): Promise<CommonSetResponseDto> {
    return this.productCategorySettingService.setProductCategoryMain(dto);
  }

  @Put('/m/:id')
  @ApiOperation({ summary: '대분류 수정' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update product category main success' })
  async putProductCategoryMain(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetProductCategoryMainReqDto,
  ): Promise<string> {
    return this.productCategorySettingService.putProductCategoryMain(id, dto);
  }

  @Delete('/m/:id')
  @ApiOperation({ summary: '대분류 삭제' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'delete product category main success' })
  async deleteProductCategoryMain(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.productCategorySettingService.deleteProductCategoryMain(id);
  }

  // ────────── 중분류 ──────────

  @Get('/s/list/:parentId')
  @ApiOperation({ summary: '중분류 목록 조회 (대분류 ID 기준)' })
  @ApiCommonResponse(GetProductCategorySubListResDto, { isArray: true, status: 200 })
  async getProductCategorySubList(@Param('parentId', ParseIntPipe) parentId: number, @Headers('lang') headerLang: string): Promise<GetProductCategorySubListResDto[]> {
    return this.productCategorySettingService.getProductCategorySubList(parentId, headerLang as Language);
  }

  @Get('/s/:id')
  @ApiOperation({ summary: '중분류 상세 조회' })
  @ApiCommonResponse(GetProductCategorySubListResDto, { isArray: false, status: 200 })
  async getProductCategorySubDetail(@Param('id', ParseIntPipe) id: number): Promise<GetProductCategorySubListResDto> {
    return this.productCategorySettingService.getProductCategorySubDetail(id);
  }

  @Get('/s/:id/product-list')
  @ApiOperation({ summary: '중분류 연결된 상품 목록 조회' })
  @ApiCommonResponse(GetProductCategoryProductListResDto, { isArray: true, status: 200 })
  async getProductCategorySubProductList(@Param('id', ParseIntPipe) id: number, @Headers('lang') headerLang: string): Promise<GetProductCategoryProductListResDto[]> {
    return this.productCategorySettingService.getProductCategoryProductList(id, headerLang as Language);
  }

  @Post('/s')
  @ApiOperation({ summary: '중분류 추가' })
  @ApiCommonResponse(CommonSetResponseDto, { isArray: false, status: 200 })
  async setProductCategorySub(@Body() dto: SetProductCategorySubReqDto): Promise<CommonSetResponseDto> {
    return this.productCategorySettingService.setProductCategorySub(dto);
  }

  @Put('/s/:id')
  @ApiOperation({ summary: '중분류 수정' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update product category sub success' })
  async putProductCategorySub(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetProductCategorySubReqDto,
  ): Promise<string> {
    return this.productCategorySettingService.putProductCategorySub(id, dto);
  }

  @Delete('/s/:id')
  @ApiOperation({ summary: '중분류 삭제' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'delete product category sub success' })
  async deleteProductCategorySub(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.productCategorySettingService.deleteProductCategorySub(id);
  }

  // ────────── 순서/사용여부 일괄 ──────────

  @Patch('/status')
  @ApiOperation({ summary: '상품 분류 순서/사용여부 일괄 수정' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update product category status success' })
  async patchProductCategoryStatus(@Body() dto: PatchProductCategoryStatusReqDto): Promise<string> {
    return this.productCategorySettingService.patchProductCategoryStatus(dto);
  }
}
