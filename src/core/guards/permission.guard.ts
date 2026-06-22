import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomException } from '@common/exceptions';
import { IS_PUBLIC_KEY } from '@common/decorators/public.decorator';
import { ADMIN_PERMISSION_KEY, USER_PERMISSION_KEY } from '@common/decorators/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {

  constructor(private readonly reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const adminKeys = this.reflector.getAllAndOverride<string[]>(ADMIN_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const userKeys = this.reflector.getAllAndOverride<string[]>(USER_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!adminKeys?.length && !userKeys?.length) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user?.permission) throw new CustomException('auth.no_permission', 'FORBIDDEN');

    const keys = adminKeys ?? userKeys;
    const hasPermission = keys.every((key) => this.resolveKey(user.permission, key));
    if (!hasPermission) throw new CustomException('auth.no_permission', 'FORBIDDEN');

    return true;
  }

  private resolveKey(permission: Record<string, any>, key: string): boolean {
    return key.split('.').reduce((obj, k) => obj?.[k], permission) === true;
  }
}
