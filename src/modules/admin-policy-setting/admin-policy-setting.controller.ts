import { Body, Controller, Get, Param, ParseIntPipe, Put } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonResponse } from '@common/dto/common-response.dto';
import { Public } from '@common/decorators/public.decorator';
import { AdminPermission } from '@common/decorators/permission.decorator';
import { AdminPolicySettingService } from './admin-policy-setting.service';
import { GetPolicyCategoryListResDto, GetPolicyCategoryDetailResDto } from './dto/get-policy/response.dto';
import { PutPolicyReqDto } from './dto/put-policy/request.dto';

// @AdminPermission('sellMenuSetting')
@Public()
@ApiExtraModels(GetPolicyCategoryListResDto, GetPolicyCategoryDetailResDto)
@ApiTags('H 약관 설정')
@Controller('/api/v1/policy-setting')
export class AdminPolicySettingController {
  constructor(private readonly adminPolicySettingService: AdminPolicySettingService) { }

  @Get('/list')
  @ApiOperation({ summary: '약관 카테고리 리스트 조회' })
  @ApiCommonResponse(GetPolicyCategoryListResDto, { status: 200 })
  async getPolicyCategoryList() {
    return await this.adminPolicySettingService.getPolicyCategoryList();
  }

  @Get('/category/:id')
  @ApiOperation({ summary: '약관 카테고리 상세 조회' })
  @ApiCommonResponse(GetPolicyCategoryDetailResDto, { status: 200 })
  async getPolicyCategoryDetail(@Param('id', ParseIntPipe) id: number) {
    return await this.adminPolicySettingService.getPolicyCategoryDetail(id);
  }

  @Put('/:id')
  @ApiOperation({ summary: '약관 수정' })
  async putPolicy(@Param('id', ParseIntPipe) id: number, @Body() dto: PutPolicyReqDto) {
    return await this.adminPolicySettingService.putPolicy(id, dto);
  }
}
