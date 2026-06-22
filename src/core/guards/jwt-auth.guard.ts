import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { CustomException } from '@common/exceptions';
import { IS_PUBLIC_KEY } from '@common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {

  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) { }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authorization = request.headers['authorization'];
    if (!authorization) throw new CustomException('auth.invalid_token', 'UNAUTHORIZED');

    const token = authorization.replace('Bearer ', '').trim();
    if (!token) throw new CustomException('auth.invalid_token', 'UNAUTHORIZED');

    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      request.user = payload;
      return true;
    } catch {
      throw new CustomException('auth.expired_token', 'UNAUTHORIZED');
    }
  }
}
