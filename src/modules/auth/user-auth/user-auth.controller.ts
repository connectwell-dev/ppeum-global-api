import { Body, Controller, Get, Headers, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonResponse } from '@common/dto/common-response.dto';
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Request } from 'express';
import { UserAuthService } from './user-auth.service';
import { LoginReqDto } from './dto/login/request.dto';
import { LoginResDto } from './dto/login/response.dto';
import { GetUserMeResDto } from './dto/me/response.dto';

@ApiExtraModels(LoginResDto, GetUserMeResDto)
@ApiTags('H 인증 > 유저 인증')
@Controller('/api/v1/auth/user')
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) { }

  @Post('/login')
  @Public()
  @ApiOperation({ summary: '유저 로그인' })
  @ApiCommonResponse(LoginResDto, { isArray: false, status: 201 })
  async login(@Req() req: Request, @Body() dto: LoginReqDto) {
    return this.userAuthService.login(dto, req);
  }

  @Post('/refresh')
  @Public()
  @ApiOperation({ summary: '액세스 토큰 갱신' })
  @ApiHeader({ name: 'x-refresh-token', description: '리프레시 토큰', required: true })
  @ApiCommonResponse({ type: 'string' }, { isArray: false, status: 201, description: 'accessToken' })
  async refresh(@Headers('x-refresh-token') refreshToken: string) {
    return this.userAuthService.refresh(refreshToken);
  }

  @Post('/logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: '유저 로그아웃' })
  @ApiHeader({ name: 'x-refresh-token', description: '리프레시 토큰', required: true })
  @ApiCommonResponse(String, { isArray: false, status: 201, example: 'logout success' })
  async logout(@Headers('x-refresh-token') refreshToken: string) {
    await this.userAuthService.logout(refreshToken);
    return 'logout success';
  }

  @Get('/permissions')
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 권한 목록 조회' })
  @ApiCommonResponse(String, { isArray: true, status: 200, example: ['visitorSetting', 'operationSetting'] })
  getPermissions(@CurrentUser('permission') permission: string[]) {
    const keys = Object.keys(permission).filter((key) => permission[key]);
    return keys;
  }

  @Get('/me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '내 정보 조회 (토큰 기반)',
    description: 'Authorization 헤더의 액세스 토큰으로 본인 정보(직원 정보 + 직급/부서 + userPermission) 를 DB 기준 최신값으로 반환',
  })
  @ApiCommonResponse(GetUserMeResDto, { isArray: false, status: 200 })
  async getMe(@CurrentUser('id') employeeId: number): Promise<GetUserMeResDto> {
    return this.userAuthService.getMe(employeeId);
  }
}
