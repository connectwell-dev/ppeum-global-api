import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductGroupSettingService } from './product-group-setting.service';
import { ApiCommonResponse, CommonSetResponseDto } from '@common/dto/common-response.dto';
import { SetProductGroupReqDto, GetProductGroupResDto } from './dto/product-group.dto';
import { Public } from '@common/decorators/public.decorator';

@Public()
@ApiExtraModels(GetProductGroupResDto, CommonSetResponseDto)
@ApiTags('H 시술|상품 설정 > 상품 설정 - 상품 그룹')
@Controller('/api/v1/product-group')
export class ProductGroupSettingController {
  constructor(private readonly productGroupSettingService: ProductGroupSettingService) {}

  @Get('/list')
  @ApiOperation({ summary: '상품 그룹 목록 조회' })
  @ApiCommonResponse(GetProductGroupResDto, { isArray: true, status: 200 })
  async getProductGroupList(): Promise<GetProductGroupResDto[]> {
    return this.productGroupSettingService.getProductGroupList();
  }

  @Get('/:id')
  @ApiOperation({ summary: '상품 그룹 상세 조회' })
  @ApiCommonResponse(GetProductGroupResDto, { isArray: false, status: 200 })
  async getProductGroup(@Param('id', ParseIntPipe) id: number): Promise<GetProductGroupResDto> {
    return this.productGroupSettingService.getProductGroup(id);
  }

  @Post('/')
  @ApiOperation({ summary: '상품 그룹 추가' })
  @ApiCommonResponse(CommonSetResponseDto, { isArray: false, status: 200 })
  async setProductGroup(@Body() dto: SetProductGroupReqDto): Promise<CommonSetResponseDto> {
    return this.productGroupSettingService.setProductGroup(dto);
  }

  @Put('/:id')
  @ApiOperation({ summary: '상품 그룹 수정' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'update product group success' })
  async putProductGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetProductGroupReqDto,
  ): Promise<string> {
    return this.productGroupSettingService.putProductGroup(id, dto);
  }

  @Delete('/:id')
  @ApiOperation({ summary: '상품 그룹 삭제' })
  @ApiCommonResponse(String, { isArray: false, status: 200, example: 'delete product group success' })
  async deleteProductGroup(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.productGroupSettingService.deleteProductGroup(id);
  }
}
