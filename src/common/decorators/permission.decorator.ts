import { SetMetadata } from '@nestjs/common';
import { AdminPermissionInterface, UserPermissionInterface } from '../interfaces/permission.interface';

/**
 * AdminPermissionInterface의 flat key
 * @example @AdminPermission('visitorSetting')
 */
export type AdminPermissionKey = keyof AdminPermissionInterface;

/**
 * UserPermissionInterface의 dot-notation key
 * @example @UserPermission('reservation.lock')
 */
type NestedKey<T> = {
  [K in keyof T]: T[K] extends boolean
    ? `${string & K}`
    : `${string & K}.${string & keyof T[K]}`;
}[keyof T];

export type UserPermissionKey = NestedKey<UserPermissionInterface>;

export const ADMIN_PERMISSION_KEY = 'adminPermission';
export const USER_PERMISSION_KEY = 'userPermission';

export const AdminPermission = (...keys: AdminPermissionKey[]) => SetMetadata(ADMIN_PERMISSION_KEY, keys);
export const UserPermission = (...keys: UserPermissionKey[]) => SetMetadata(USER_PERMISSION_KEY, keys);
