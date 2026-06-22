import { Controller, Get, Put, Body, Query, ParseIntPipe, Headers, Patch } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductMenuBoardSettingService } from './product-menu-board-setting.service';
import { ApiCommonResponse } from '@common/dto/common-response.dto';
import { PatchMenuBoardStatusReqDto } from './dto/patch-menu-board/request.dto';
import { GetMenuBoardProductListResDto } from './dto/get-menu-board-product/response.dto';
import { Language } from '@prisma/client';
import { SettingService } from '@src/core/setting/setting.service';
import { Public } from '@common/decorators/public.decorator';

@Public()
@ApiTags('H 시술|상품 설정 > 상품 설정 - 메뉴판 노출 순위')
@Controller('/api/v1/product-menu-board')
@ApiExtraModels(GetMenuBoardProductListResDto)
export class ProductMenuBoardSettingController {
  constructor(
    private readonly productMenuBoardSettingService: ProductMenuBoardSettingService,
    private readonly settingService: SettingService,
  ) { }

  @Get('/list')
  @ApiOperation({ summary: '메뉴판 분류별 상품 목록 조회 (순위 설정용)' })
  @ApiCommonResponse(GetMenuBoardProductListResDto, { isArray: true, status: 200 })
  async getMenuBoardProductList(@Query('productCategoryId', ParseIntPipe) productCategoryId: number, @Headers('lang') headerLang: string): Promise<GetMenuBoardProductListResDto[]> {
    return this.productMenuBoardSettingService.getMenuBoardProductList(productCategoryId, headerLang as Language);
  }

  @Patch('/status')
  @ApiOperation({ summary: '메뉴판 분류별 상품 노출 상태 변경' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update menu board order success' })
  async patchMenuBoardStatus(@Body() dto: PatchMenuBoardStatusReqDto): Promise<string> {
    return this.productMenuBoardSettingService.patchMenuBoardStatus(dto);
  }
}
