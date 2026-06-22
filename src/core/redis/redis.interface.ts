// redis.types.ts

export interface AuthTokenPayload {
  userId: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenData {
  userId: number;
  tokenHash: string;
  issuedAt: string;
}

// 키 패턴 상수도 함께 관리
export const REDIS_KEY = {
  REFRESH_TOKEN: (employeeId: number, sessionId: string) => `auth:refresh:${employeeId}:${sessionId}`,
  BLACKLIST: (tokenHash: string) => `auth:blacklist:${tokenHash}`,
} as const;