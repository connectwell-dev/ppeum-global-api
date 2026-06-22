import { Body, Controller, Get, Headers, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonResponse } from '@common/dto/common-response.dto';
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Request } from 'express';
import { AdminAuthService } from './admin-auth.service';
import { LoginReqDto } from './dto/login/request.dto';
import { LoginResDto } from './dto/login/response.dto';
import { GetAdminMeResDto } from './dto/me/response.dto';

@ApiExtraModels(LoginResDto, GetAdminMeResDto)
@ApiTags('H 인증 > 어드민 인증')
@Controller('/api/v1/auth/admin')
export class AdminAuthController {

  constructor(private readonly adminAuthService: AdminAuthService) { }

  @Post('/login')
  @Public()
  @ApiOperation({ summary: '어드민 로그인' })
  @ApiCommonResponse(LoginResDto, { isArray: false, status: 201 })
  async login(@Req() req: Request, @Body() dto: LoginReqDto) {
    return this.adminAuthService.login(dto, req);
  }

  @Post('/refresh')
  @Public()
  @ApiOperation({ summary: '액세스 토큰 갱신' })
  @ApiHeader({ name: 'x-refresh-token', description: '리프레시 토큰', required: true })
  @ApiCommonResponse({ type: 'string' }, { isArray: false, status: 201, description: 'accessToken' })
  async refresh(@Headers('x-refresh-token') refreshToken: string) {
    return this.adminAuthService.refresh(refreshToken);
  }

  @Post('/logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: '어드민 로그아웃' })
  @ApiHeader({ name: 'x-refresh-token', description: '리프레시 토큰', required: true })
  @ApiCommonResponse(String, { isArray: false, status: 201, example: 'logout success' })
  async logout(@Headers('x-refresh-token') refreshToken: string) {
    await this.adminAuthService.logout(refreshToken);
    return 'logout success';
  }

  @Get('/permissions')
  @ApiOperation({ summary: '내 권한 목록 조회' })
  @ApiCommonResponse(String, { isArray: true, status: 200, example: ['visitorSetting', 'operationSetting'] })
  getPermissions(@CurrentUser('permission') permission: string[]) {
    const keys = Object.keys(permission).filter((key) => permission[key]);
    return keys
  }

  @Get('/me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '내 정보 조회 (토큰 기반)',
    description: 'Authorization 헤더의 액세스 토큰으로 본인 정보(직원 정보 + 직급/부서 + adminPermission) 를 DB 기준 최신값으로 반환',
  })
  @ApiCommonResponse(GetAdminMeResDto, { isArray: false, status: 200 })
  async getMe(@CurrentUser('id') employeeId: number): Promise<GetAdminMeResDto> {
    return this.adminAuthService.getMe(employeeId);
  }
}
