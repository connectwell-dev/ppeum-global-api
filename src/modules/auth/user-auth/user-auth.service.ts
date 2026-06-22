import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createClient } from 'redis';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { CustomException } from '@common/exceptions';
import { REDIS_KEY } from '@src/core/redis/redis.interface';
import { extractConnectionInfo, saveLoginHistory } from '@common/utils/login.util';
import { LoginReqDto } from './dto/login/request.dto';
import { LoginResDto } from './dto/login/response.dto';
import { GetUserMeResDto } from './dto/me/response.dto';
import { EmploymentStatus, Platform } from '@prisma/client';

@Injectable()
export class UserAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redisClient: ReturnType<typeof createClient>,
  ) { }

  async login(dto: LoginReqDto, req: Request): Promise<LoginResDto> {
    const connectionInfo = extractConnectionInfo(req);
    try {
      const employee = await this.prisma.employee.findFirst({
        where: { loginId: dto.id, deletedAt: null },
        select: { id: true, loginId: true, name: true, password: true, employmentStatus: true, userPermission: true },
      });

      if (!employee) throw new CustomException('auth.invalid_credentials', 'BAD_REQUEST');
      if (employee.employmentStatus === EmploymentStatus.resigned) throw new CustomException('auth.inactive_account', 'BAD_REQUEST');

      const isPasswordValid = await bcrypt.compare(dto.password, employee.password);
      if (!isPasswordValid) {
        await saveLoginHistory(this.prisma, employee.id, Platform.CRM, false, connectionInfo, '비밀번호 불일치');
        throw new CustomException('auth.invalid_credentials', 'BAD_REQUEST');
      }

      const sessionId = randomUUID();
      const accessTokenPayload = { id: employee.id, loginId: employee.loginId, name: employee.name, platform: Platform.CRM, sessionId, permission: employee.userPermission };
      const refreshTokenPayload = { id: employee.id, platform: Platform.CRM, sessionId };

      const accessToken = this.jwtService.sign(accessTokenPayload as any, {
        secret: process.env.JWT_SECRET,
        expiresIn: (process.env.JWT_EXPIRATION ? `${process.env.JWT_EXPIRATION}d` : '1d') as any,
      });

      const refreshToken = this.jwtService.sign(refreshTokenPayload as any, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: (process.env.JWT_REFRESH_EXPIRATION ? `${process.env.JWT_REFRESH_EXPIRATION}d` : '7d') as any,
      });

      const refreshExpireSec = Number(process.env.JWT_REFRESH_EXPIRATION) * 24 * 60 * 60;
      await this.redisClient.setEx(REDIS_KEY.REFRESH_TOKEN(employee.id, sessionId), refreshExpireSec, refreshToken);
      await saveLoginHistory(this.prisma, employee.id, Platform.CRM, true, connectionInfo);

      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      let payload: any;
      try {
        payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
        if (!payload.id) throw new CustomException('auth.invalid_token', 'UNAUTHORIZED');
        if (payload.exp < Date.now() / 1000) throw new CustomException('auth.expired_token', 'UNAUTHORIZED');
        if (payload.platform !== Platform.CRM) throw new CustomException('common.invalid_request', 'UNAUTHORIZED');
      } catch {
        throw new CustomException('common.invalid_request', 'UNAUTHORIZED');
      }

      const storedToken = await this.redisClient.get(REDIS_KEY.REFRESH_TOKEN(payload.id, payload.sessionId));
      if (!storedToken || storedToken !== refreshToken) throw new CustomException('auth.invalid_token', 'UNAUTHORIZED');

      const employee = await this.prisma.employee.findFirst({
        where: { id: payload.id, deletedAt: null },
        select: { id: true, loginId: true, name: true, userPermission: true },
      });
      if (!employee) throw new CustomException('auth.invalid_token', 'UNAUTHORIZED');

      const accessToken = this.jwtService.sign(
        { id: employee.id, loginId: employee.loginId, name: employee.name, platform: Platform.CRM, sessionId: payload.sessionId, permission: employee.userPermission } as any,
        { secret: process.env.JWT_SECRET, expiresIn: (process.env.JWT_EXPIRATION ? `${process.env.JWT_EXPIRATION}d` : '1d') as any },
      );

      return { accessToken };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload: any = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
      await this.redisClient.del(REDIS_KEY.REFRESH_TOKEN(payload.id, payload.sessionId));
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 내 정보 조회 (토큰 기반)
  // - JWT 의 employeeId 로 DB fresh fetch (직급/부서/권한 포함)
  // - userPermission 노출 (admin-auth 와 반대)
  // ───────────────────────────────────────────────────────────────────────────
  async getMe(employeeId: number): Promise<GetUserMeResDto> {
    try {
      const employee = await this.prisma.employee.findFirst({
        where: { id: employeeId, deletedAt: null },
        select: {
          id: true,
          loginId: true,
          name: true,
          employeeType: true,
          employmentStatus: true,
          rankId: true,
          email: true,
          phoneNumber: true,
          isResetPassword: true,
          userPermission: true,
          rank: { select: { name: true, parent: { select: { name: true } } } },
        },
      });
      if (!employee) throw new CustomException('auth.invalid_token', 'UNAUTHORIZED');

      return {
        id: employee.id,
        loginId: employee.loginId,
        name: employee.name,
        employeeType: employee.employeeType,
        employmentStatus: employee.employmentStatus,
        platform: Platform.CRM,
        rankId: employee.rankId,
        rankName: employee.rank?.name ?? null,
        deptName: employee.rank?.parent?.name ?? null,
        email: employee.email,
        phoneNumber: employee.phoneNumber,
        isResetPassword: employee.isResetPassword,
        permission: (employee.userPermission ?? {}) as Record<string, unknown>,
      };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }
}
