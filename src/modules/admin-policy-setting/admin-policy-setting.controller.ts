import { Body, Controller, Get, Param, ParseIntPipe, Put } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonResponse } from '@common/dto/common-response.dto';
import { Public } from '@common/decorators/public.decorator';
import { AdminPermission } from '@common/decorators/permission.decorator';
import { AdminPolicySettingService } from './admin-policy-setting.service';
import { GetPolicyListResDto, GetPolicyDetailResDto } from './dto/get-policy/response.dto';
import { PutPolicyReqDto } from './dto/put-policy/request.dto';

// @AdminPermission('sellMenuSetting')
@Public()
@ApiExtraModels(GetPolicyListResDto, GetPolicyDetailResDto)
@ApiTags('H 약관 설정')
@Controller('/api/v1/policy-setting')
export class AdminPolicySettingController {
  constructor(private readonly adminPolicySettingService: AdminPolicySettingService) { }

  @Get('/list')
  @ApiOperation({ summary: '약관 리스트 조회' })
  @ApiCommonResponse(GetPolicyListResDto, { status: 200 })
  async getPolicyList() {
    return await this.adminPolicySettingService.getPoliicyList();
  }

  @Get('/:id')
  @ApiOperation({ summary: '약관 상세 조회' })
  @ApiCommonResponse(GetPolicyDetailResDto, { status: 200 })
  async getPolicyDetail(@Param('id', ParseIntPipe) id: number) {
    return await this.adminPolicySettingService.getPoliicyDetail(id);
  }

  @Put('/:id')
  @ApiOperation({ summary: '약관 수정' })
  async putPolicy(@Param('id', ParseIntPipe) id: number, @Body() dto: PutPolicyReqDto) {
    return await this.adminPolicySettingService.putPolicy(id, dto);
  }
}
