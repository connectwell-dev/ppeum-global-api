import { Request } from 'express';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { Platform } from '@prisma/client';

export function extractConnectionIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]).trim();
  return req.ip ?? '';
}

export function extractBrowser(userAgent: string): string {
  if (/Edg\//.test(userAgent)) return 'Edge';
  if (/Chrome\//.test(userAgent)) return 'Chrome';
  if (/Firefox\//.test(userAgent)) return 'Firefox';
  if (/Safari\//.test(userAgent)) return 'Safari';
  if (/MSIE|Trident/.test(userAgent)) return 'IE';
  return 'Unknown';
}

export function extractOs(userAgent: string): string {
  if (/iPhone|iPad/.test(userAgent)) return 'iOS';
  if (/Android/.test(userAgent)) return 'Android';
  if (/Windows NT/.test(userAgent)) return 'Windows';
  if (/Mac OS X/.test(userAgent)) return 'macOS';
  if (/Linux/.test(userAgent)) return 'Linux';
  return 'Unknown';
}

export function extractConnectionInfo(req: Request) {
  const userAgent = req.headers['user-agent'] ?? '';
  return {
    connectionIp: extractConnectionIp(req),
    connectionBrowser: extractBrowser(userAgent),
    connectionOs: extractOs(userAgent),
    connectionUrl: (req.headers['referer'] as string) ?? req.originalUrl ?? null,
  };
}

export async function saveLoginHistory(
  prisma: PrismaService,
  employeeId: number,
  platform: Platform,
  isSuccess: boolean,
  connectionInfo: ReturnType<typeof extractConnectionInfo>,
  note?: string,
): Promise<void> {
  await prisma.historyLogin.create({
    data: { employeeId, platform, isSuccess, ...connectionInfo, note: note ?? null },
  }).catch(() => { }); // 히스토리 저장 실패가 로그인에 영향을 주지 않도록
}
