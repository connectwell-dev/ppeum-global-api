import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { AdminPermission } from '@common/decorators/permission.decorator';
import { AdminPolicySettingService } from './admin-policy-setting.service';

// @AdminPermission('sellMenuSetting')
@Public()
@ApiTags('H 약관 설정')
@Controller('/api/v1/policy-setting')
@Public()
export class AdminPolicySettingController {
  constructor(private readonly adminPolicySettingService: AdminPolicySettingService) { }

  @Get('/list')
  @ApiOperation({ summary: '약관 리스트 조회' })
  async getPolicyList() {
    return await this.adminPolicySettingService.getPoilicyList();
  }

  @Get('/:id')
  @ApiOperation({ summary: '약관 상세 조회' })
  async getPolicyDetail(@Param('id', ParseIntPipe) id: number) {
    return await this.adminPolicySettingService.getPoilicyDetail(id);
  }
}
