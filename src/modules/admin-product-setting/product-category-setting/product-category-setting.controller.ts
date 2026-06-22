import { Controller, Get, Post, Put, Patch, Delete, Body, Param, ParseIntPipe, Headers } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductCategorySettingService } from './product-category-setting.service';
import { ApiCommonResponse, CommonSetResponseDto } from '@common/dto/common-response.dto';
import { SetProductCategoryReqDto } from './dto/set-product-category/request.dto';
import { PatchProductCategoryStatusReqDto } from './dto/patch-product-category/request.dto';
import { GetProductCategoryProductListResDto } from './dto/get-product-category-product/response.dto';
import { Language } from '@prisma/client';
import { GetProductCategoryListResDto } from './dto/get-product-category/response.dto';
import { Public } from '@common/decorators/public.decorator';

@Public()
@ApiExtraModels(GetProductCategoryListResDto, CommonSetResponseDto, GetProductCategoryProductListResDto)
@ApiTags('H 시술|상품 설정 > 상품 설정 - 상품 분류')
@Controller('/api/v1/product-category')
export class ProductCategorySettingController {
  constructor(private readonly productCategorySettingService: ProductCategorySettingService) { }

  @Get('/list')
  @ApiOperation({ summary: '상품 분류 목록 조회' })
  @ApiCommonResponse(GetProductCategoryListResDto, { isArray: true, status: 200 })
  async getProductCategoryList(@Headers('lang') headerLang: string): Promise<GetProductCategoryListResDto[]> {
    return this.productCategorySettingService.getProductCategoryList(headerLang as Language);
  }

  @Get('/:id')
  @ApiOperation({ summary: '상품 분류 상세 조회' })
  @ApiCommonResponse(GetProductCategoryListResDto, { isArray: false, status: 200 })
  async getProductCategoryDetail(@Param('id', ParseIntPipe) id: number): Promise<GetProductCategoryListResDto> {
    return this.productCategorySettingService.getProductCategoryDetail(id);
  }

  @Get('/:id/product-list')
  @ApiOperation({ summary: '분류에 연결된 상품 목록 조회' })
  @ApiCommonResponse(GetProductCategoryProductListResDto, { isArray: true, status: 200 })
  async getProductCategoryProductList(@Param('id', ParseIntPipe) id: number, @Headers('lang') headerLang: string): Promise<GetProductCategoryProductListResDto[]> {
    return this.productCategorySettingService.getProductCategoryProductList(id, headerLang as Language);
  }

  @Post('/')
  @ApiOperation({ summary: '상품 분류 추가' })
  @ApiCommonResponse(CommonSetResponseDto, { isArray: false, status: 200 })
  async setProductCategory(@Body() dto: SetProductCategoryReqDto): Promise<CommonSetResponseDto> {
    return this.productCategorySettingService.setProductCategory(dto);
  }

  @Put('/:id')
  @ApiOperation({ summary: '상품 분류 수정' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update product category success' })
  async putProductCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetProductCategoryReqDto,
  ): Promise<string> {
    return this.productCategorySettingService.putProductCategory(id, dto);
  }

  @Delete('/:id')
  @ApiOperation({ summary: '상품 분류 삭제' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'delete product category success' })
  async deleteProductCategory(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.productCategorySettingService.deleteProductCategory(id);
  }

  @Patch('/status')
  @ApiOperation({ summary: '상품 분류 순서/사용여부 일괄 수정' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update product category status success' })
  async patchProductCategoryStatus(@Body() dto: PatchProductCategoryStatusReqDto): Promise<string> {
    return this.productCategorySettingService.patchProductCategoryStatus(dto);
  }
}
