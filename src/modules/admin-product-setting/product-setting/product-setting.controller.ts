import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBody, ApiConsumes, ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ProductSettingService } from './product-setting.service';
import { ProductUploadTemplateService } from './product-upload-template.service';
import { ProductUploadService } from './product-upload.service';
import { ApiCommonResponse, CommonSetResponseDto } from '@common/dto/common-response.dto';
import { ApiPaginatedResponse, PaginatedResponseDto } from '@common/dto/pagination.dto';
import { SetProductReqDto } from './dto/set-product/request.dto';
import { PutProductReqDto, PutProductTranslationReqDto, PutProductPublicTranslationReqDto } from './dto/put-product/request.dto';
import { GetProductCategoryListResDto } from '../product-category-setting/dto/get-product-category/response.dto';
import { GetProductListReqDto } from './dto/get-product/query.dto';
import { GetProductDetailResDto, GetProductListResDto, GetProductTranslationResDto } from './dto/get-product/response.dto';
import { Language } from '@prisma/client';
import { SettingService } from '@src/core/setting/setting.service';
import { LanguageReqDto } from '@common/dto/common-patch.dto';
import { Public } from '@common/decorators/public.decorator';

@Public()
@ApiExtraModels(GetProductDetailResDto, GetProductListResDto, GetProductTranslationResDto, CommonSetResponseDto)
@ApiTags('H 시술|상품 설정 > 상품 설정 - 상품')
@Controller('/api/v1/product')
export class ProductSettingController {
  constructor(
    private readonly productSettingService: ProductSettingService,
    private readonly productUploadTemplateService: ProductUploadTemplateService,
    private readonly productUploadService: ProductUploadService,
    private readonly settingService: SettingService,
  ) { }

  @Get('/upload-template')
  @ApiOperation({ summary: '상품 일괄등록 엑셀 템플릿 다운로드' })
  async getUploadTemplate(@Res() res: Response): Promise<void> {
    const buffer = await this.productUploadTemplateService.generateTemplate();
    const filename = encodeURIComponent('상품_업로드_템플릿.xlsx');
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${filename}`,
    });
    res.end(buffer);
  }

  @Post('/upload')
  @ApiOperation({ summary: '상품 일괄등록 엑셀 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadProducts(@UploadedFile() file: Express.Multer.File): Promise<{ total: number; success: number; errors: { row: number; message: string }[] }> {
    if (!file) throw new Error('파일을 첨부해 주세요.');
    return this.productUploadService.uploadProducts(file.buffer);
  }

  @Get('/list')
  @ApiOperation({ summary: '상품 목록 조회' })
  @ApiPaginatedResponse(GetProductListResDto, { status: 200 })
  async getProductList(@Query() dto: GetProductListReqDto, @Headers('lang') headerLang: string): Promise<PaginatedResponseDto<GetProductListResDto>> {
    return this.productSettingService.getProductList(dto, headerLang as Language);
  }

  @Get('/:id')
  @ApiOperation({ summary: '상품 상세 조회' })
  @ApiCommonResponse(GetProductDetailResDto, { isArray: false, status: 200 })
  async getProductDetail(@Param('id') id: number, @Headers('lang') headerLang: string): Promise<GetProductDetailResDto> {
    return this.productSettingService.getProductDetail(id, headerLang as Language);
  }

  @Get('/:id/translation')
  @ApiOperation({ summary: '상품 번역 조회 (특정 언어)' })
  @ApiCommonResponse(GetProductTranslationResDto, { isArray: false, status: 200 })
  async getProductTranslation(@Param('id') id: number, @Query() dto: LanguageReqDto, @Headers('lang') headerLang: string): Promise<GetProductTranslationResDto> {
    return this.productSettingService.getProductTranslation(id, dto.language as Language, headerLang as Language);
  }

  @Get('/:id/product-category-list')
  @ApiOperation({ summary: '상품 연결된 카테고리 목록 조회' })
  @ApiCommonResponse(GetProductCategoryListResDto, { isArray: true, status: 200 })
  async getProductCategoryList(@Param('id') id: number, @Headers('lang') headerLang: string): Promise<GetProductCategoryListResDto[]> {
    return this.productSettingService.getProductCategoryList(id, headerLang as Language);
  }

  @Post('/')
  @ApiOperation({ summary: '상품 추가' })
  @ApiCommonResponse(CommonSetResponseDto, { isArray: false, status: 200 })
  async setProduct(@Body() dto: SetProductReqDto): Promise<CommonSetResponseDto> {
    return this.productSettingService.setProduct(dto);
  }

  @Put('/:id')
  @ApiOperation({ summary: '상품 수정 (기준언어)' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update product success' })
  async putProduct(@Param('id') id: number, @Body() dto: PutProductReqDto): Promise<string> {
    return this.productSettingService.putProduct(id, dto);
  }

  @Put('/:id/public-translation')
  @ApiOperation({ summary: '상품 공용언어 번역 수정' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update product translation success' })
  async putProductPublicTranslation(@Param('id') id: number, @Body() dto: PutProductPublicTranslationReqDto): Promise<string> {
    return this.productSettingService.putProductPublicTranslation(id, dto);
  }

  @Put('/:id/translation')
  @ApiOperation({ summary: '상품 기타언어 번역 수정' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update product translation success' })
  async putProductTranslation(@Param('id') id: number, @Body() dto: PutProductTranslationReqDto): Promise<string> {
    return this.productSettingService.putProductTranslation(id, dto);
  }

  @Delete('/:id')
  @ApiOperation({ summary: '상품 삭제' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'delete product success' })
  async deleteProduct(@Param('id') id: number): Promise<string> {
    return this.productSettingService.deleteProduct(id);
  }
}
