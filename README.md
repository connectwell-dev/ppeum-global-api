# PPEUM Global API

NestJS(v11) + Prisma(v7) 기반 API 서버.

## 요구 사항

- Node.js >= 20
- PostgreSQL (또는 `prisma/schema.prisma`의 `datasource` 변경)

## 설치

```bash
npm install
```

## 환경 변수

`.env.example`를 복사해 `.env`를 만들고 값을 채웁니다.

```bash
cp .env.example .env
```

| 변수 | 설명 |
| --- | --- |
| `PORT` | 서버 포트 (기본 3000) |
| `NODE_ENV` | 실행 환경 |
| `DATABASE_URL` | PostgreSQL 연결 문자열 |

## Prisma

```bash
# Prisma Client 생성
npm run prisma:generate

# 마이그레이션 (개발)
npm run prisma:migrate

# Prisma Studio
npm run prisma:studio
```

## 실행

```bash
# 개발 (watch)
npm run start:dev

# 프로덕션 빌드 후 실행
npm run build
npm run start:prod
```

기본 헬스 체크: `GET /api/health`

## 기술 스택

- **NestJS** `^11.1.13`
- **Prisma / @prisma/client** `^7.0.0`
- **TypeScript** `^5.7`
