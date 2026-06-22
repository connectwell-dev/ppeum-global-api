import { DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import { ERROR_MESSAGE } from '../constants/error-message';

/**
 * Swagger 문서 설정
 */
export const swaggerConfig = new DocumentBuilder()
  .setTitle('PPEUM Global API')
  .setDescription('PPEUM Global 시스템 API 문서')
  .setVersion('1.0')
  .addBearerAuth()
  .addSecurityRequirements('bearer')
  .addGlobalParameters({
    name: 'lang',
    in: 'header',
    required: false,
    description: '언어 코드 (ja, ko, en, zhCN, zhTW, th, vi, ru)',
    schema: {
      type: 'string',
      default: 'ja',
    },
  })
  .build();

/** 태그명 → 섹션 상단 설명(마크다운). createDocument 이후 applyTagDescriptions 로 주입 */
export const TAG_DESCRIPTIONS: Record<string, string> = {};

/**
 * 태그(섹션) 상단 description 주입 — Swagger UI 가 태그 설명을 마크다운으로 렌더링.
 * 이미 존재하는 태그면 description 만 채우고, 없으면 새로 추가한다.
 */
export function applyTagDescriptions(document: OpenAPIObject, descriptions: Record<string, string> = TAG_DESCRIPTIONS): void {
  const tags = document.tags ?? [];
  for (const [name, description] of Object.entries(descriptions)) {
    const existing = tags.find((t) => t.name === name);
    if (existing) existing.description = description;
    else tags.push({ name, description });
  }
  document.tags = tags;
}

/**
 * 모든 API에 공통 에러 응답(400, 500)을 자동 추가
 */
const errorSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'BAD_REQUEST_ERROR' },
        message: { type: 'string', example: '에러 메세지' },
        options: {
          type: 'object',
          properties: {
            messageDetail: { type: 'string', description: '상세 에러 (개발 환경만)', example: '상세 에러 메세지(개발 환경만)' },
            field: { type: 'string', description: '에러 필드', example: 'name' },
            fieldMessage: { type: 'string', description: '에러 필드 메세지', example: '이미 존재하는 이름입니다.' },
          },
        },
      },
    },
  },
};

/**
 * API 에러 코드 목록을 Swagger description에 표시
 * @example @ApiOperation({ summary: '시술 조회', description: ApiErrorCodes('common.errorMessage') })
 */
export function ApiErrorCodes(...errorKeys: (keyof typeof ERROR_MESSAGE)[]): string {
  const rows = errorKeys
    .map((key) => {
      const messages = ERROR_MESSAGE[key];
      if (!messages) return null;
      return `| ${messages.ko || ''} |`;
    })
    .filter(Boolean)
    .join('\n');

  return `
### 에러 목록
| message (ko)) |
|---------------|
${rows}
`;
}

/** User 쪽 API 경로 패턴 (`applySwaggerTagGroups` / 그룹 기본값과 맞출 것) */
const USER_API_PATH_PREFIX = '/api/v1/user/';

/**
 * SpringDoc `GroupedOpenApi` 와 동일한 개념: `group` = Swagger UI Definition 이름, `pathsToMatch` = Ant-style path (`/api/item/**`).
 * `excludePathPrefixes`: `pathsToMatch`에 걸려도 제외 (예: Admin 그룹에서 `/api/v1/**` 쓰고 User 는 `/api/v1/user/` 제외)
 */
export type SwaggerGroupedOpenApiConfig = {
  group: string;
  pathsToMatch: string[];
  excludePathPrefixes?: string[];
};

/**
 * 그룹별 스펙 분리 (빈 배열이면 Nest 기본처럼 단일 문서만 사용)
 */
export const SWAGGER_GROUPED_OPEN_API: SwaggerGroupedOpenApiConfig[] = [
  { group: 'user', pathsToMatch: ['/api/v1/user/**', '/api/v1/auth/user/**'] },
  {
    group: 'admin',
    pathsToMatch: ['/api/v1/**'],
    excludePathPrefixes: [USER_API_PATH_PREFIX],
  },
];

/** Spring `pathsToMatch("/api/item/**")` 와 동일한 prefix 매칭 */
export function pathMatchesSpringPathPattern(pattern: string, pathKey: string): boolean {
  let p = pattern.trim();
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.endsWith('/**')) p = p.slice(0, -3);
  else if (p.endsWith('**')) p = p.replace(/\*\*$/, '');
  p = p.replace(/\/+$/, '');
  return pathKey === p || pathKey.startsWith(`${p}/`);
}

export function pathMatchesGroupedConfig(pathKey: string, cfg: SwaggerGroupedOpenApiConfig): boolean {
  const matched = cfg.pathsToMatch.some((pat) => pathMatchesSpringPathPattern(pat, pathKey));
  if (!matched) return false;
  if (cfg.excludePathPrefixes?.length) {
    for (const ex of cfg.excludePathPrefixes) {
      const base = ex.replace(/\/+$/, '');
      if (!base) continue;
      if (pathKey === base || pathKey.startsWith(`${base}/`)) return false;
    }
  }
  return true;
}

export function swaggerGroupedJsonSlug(group: string): string {
  return (
    group
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'group'
  );
}

export function filterOpenApiPaths(
  document: OpenAPIObject,
  predicate: (pathKey: string) => boolean,
): OpenAPIObject {
  const paths = document.paths ?? {};
  const filteredPaths: NonNullable<OpenAPIObject['paths']> = {};
  const usedTagNames = new Set<string>();

  for (const [pathKey, pathItem] of Object.entries(paths)) {
    if (!pathItem || !predicate(pathKey)) continue;
    filteredPaths[pathKey] = pathItem;
    for (const method of ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const) {
      const op = pathItem[method] as { tags?: string[] } | undefined;
      if (!op?.tags?.length) continue;
      for (const t of op.tags) usedTagNames.add(t);
    }
  }

  const origByName = new Map((document.tags ?? []).map((t) => [t.name, t]));
  const filteredTags = [...usedTagNames].sort().map((name) => origByName.get(name) ?? { name });

  const base: OpenAPIObject = { ...document, paths: filteredPaths };
  if (filteredTags.length) base.tags = filteredTags;
  else delete base.tags;

  delete (base as OpenAPIObject & { 'x-tagGroups'?: unknown })['x-tagGroups'];
  return base;
}

export function buildOpenApiDocumentForGroup(
  document: OpenAPIObject,
  cfg: SwaggerGroupedOpenApiConfig,
): OpenAPIObject {
  return filterOpenApiPaths(document, (pathKey) => pathMatchesGroupedConfig(pathKey, cfg));
}

type TagGroup = { name: string; tags: string[] };

/**
 * Swagger UI `x-tagGroups`: Admin / User 로 태그 묶기.
 */
export function applySwaggerTagGroups(document: OpenAPIObject): void {
  const tagAdminCount = new Map<string, number>();
  const tagUserCount = new Map<string, number>();

  const bump = (m: Map<string, number>, tag: string) => {
    m.set(tag, (m.get(tag) ?? 0) + 1);
  };

  for (const pathKey of Object.keys(document.paths ?? {})) {
    const isUser = pathKey.includes(USER_API_PATH_PREFIX);
    const pathItem = document.paths![pathKey];
    for (const method of ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const) {
      const op = pathItem[method] as { tags?: string[] } | undefined;
      if (!op?.tags?.length) continue;
      for (const tag of op.tags) {
        if (isUser) bump(tagUserCount, tag);
        else bump(tagAdminCount, tag);
      }
    }
  }

  const allTags = new Set<string>([...tagAdminCount.keys(), ...tagUserCount.keys()]);
  const adminTags: string[] = [];
  const userTags: string[] = [];

  for (const tag of allTags) {
    const a = tagAdminCount.get(tag) ?? 0;
    const u = tagUserCount.get(tag) ?? 0;
    if (u > a) userTags.push(tag);
    else if (a > u) adminTags.push(tag);
    else if (a > 0 && u > 0) adminTags.push(tag);
    else if (u > 0) userTags.push(tag);
    else adminTags.push(tag);
  }

  adminTags.sort((x, y) => x.localeCompare(y));
  userTags.sort((x, y) => x.localeCompare(y));

  const groups: TagGroup[] = [];
  if (adminTags.length) groups.push({ name: 'Admin', tags: adminTags });
  if (userTags.length) groups.push({ name: 'User', tags: userTags });

  if (groups.length) {
    (document as OpenAPIObject & { 'x-tagGroups'?: TagGroup[] })['x-tagGroups'] = groups;
  }
}

export function applyGlobalErrorResponses(document: OpenAPIObject): void {
  for (const path of Object.values(document.paths)) {
    for (const method of Object.values(path)) {
      if (typeof method === 'object' && method !== null && 'responses' in method) {
        const responses = (method as any).responses;
        if (!responses['400']) {
          responses['400'] = {
            description: '잘못된 요청',
            content: { 'application/json': { schema: errorSchema } },
          };
        }
        if (!responses['500']) {
          responses['500'] = {
            description: '서버 내부 오류',
            content: { 'application/json': { schema: errorSchema } },
          };
        }
      }
    }
  }
}
