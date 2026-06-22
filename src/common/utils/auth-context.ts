import { PrismaService } from '@src/core/prisma/prisma.service';
import { EmployeeType } from '@prisma/client';

// ─── 인증 컨텍스트 헬퍼 ───────────────────────────────────────────────────────
// 목적: createParamDecorator 안에서는 NestJS DI 가 적용되지 않으므로,
//       부팅 시 main.ts 가 PrismaService 인스턴스를 등록(setAuthContextPrisma)해 두고,
//       데코레이터 등 비-DI 위치에서 lazy lookup 으로 fallback 직원 id 를 결정한다.
//
// 정책: 운영 환경(NODE_ENV=production)에서는 fallback 비활성 (인증 가드가 토큰 강제).
//       개발/테스트 환경에서 토큰 없을 때만 super_admin 직원 1명의 id 를 반환.
//       (super_admin 이 여러 명이면 id asc 첫 번째).

let prismaInstance: PrismaService | null = null;
let cachedSuperAdminId: number | null = null;

export function setAuthContextPrisma(prisma: PrismaService): void {
  prismaInstance = prisma;
}

export async function resolveTestFallbackEmployeeId(): Promise<number | null> {
  if (process.env.NODE_ENV === 'production') return null;
  if (cachedSuperAdminId != null) return cachedSuperAdminId;
  if (!prismaInstance) return null;

  const emp = await prismaInstance.employee.findFirst({
    where: { employeeType: EmployeeType.super_admin, deletedAt: null },
    select: { id: true },
    orderBy: { id: 'asc' },
  });
  if (!emp) return null;
  cachedSuperAdminId = emp.id;
  return cachedSuperAdminId;
}
