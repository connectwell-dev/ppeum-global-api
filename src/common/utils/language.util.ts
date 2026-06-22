import { Language } from '@prisma/client';

/** Prisma `Language` 코드 → 관리 화면용 한글 표시명 */
export const LANGUAGE_CODE_LABEL_KO: Record<Language, string> = {
  [Language.ja]: '일본어',
  [Language.ko]: '한국어',
  [Language.en]: '영어',
  [Language.zhCN]: '중국어(간체)',
  [Language.zhTW]: '중국어(번체)',
  [Language.th]: '태국어',
  [Language.vi]: '베트남어',
  [Language.ru]: '러시아어',
};

/**
 * `general_info.useLanguage` JSON 키 → Prisma `Language` 문자열 코드.
 * JSON 키는 Prisma `Language`와 동일하게 통일(zhCN/zhTW)했으나,
 * 구버전 데이터(zhCn/zhTw)도 호환되도록 함께 매핑한다.
 */
export const USE_LANGUAGE_JSON_KEY_TO_PRISMA_CODE: Record<string, string> = {
  ja: 'ja',
  ko: 'ko',
  en: 'en',
  zhCn: 'zhCN',
  zhCN: 'zhCN',
  zhTw: 'zhTW',
  zhTW: 'zhTW',
  th: 'th',
  vi: 'vi',
  ru: 'ru',
};

/** Prisma `Language` → `general_info.useLanguage` JSON 키 (JSON 키와 동일) */
export const LANGUAGE_TO_USE_LANGUAGE_JSON_KEY: Record<Language, string> = {
  [Language.ja]: 'ja',
  [Language.ko]: 'ko',
  [Language.en]: 'en',
  [Language.zhCN]: 'zhCN',
  [Language.zhTW]: 'zhTW',
  [Language.th]: 'th',
  [Language.vi]: 'vi',
  [Language.ru]: 'ru',
};

const LANGUAGE_VALUE_SET = new Set<string>(Object.values(Language) as string[]);

/**
 * DTO 등 API 문자열(ja, zhCN, zhCn …)을 Prisma Language로 변환. 실패 시 null.
 */
export function parseUseLanguageParamToLanguage(raw: string): Language | null {
  const t = typeof raw === 'string' ? raw.trim() : '';
  if (!t) return null;
  if (LANGUAGE_VALUE_SET.has(t)) {
    return t as Language;
  }
  const prismaCode = USE_LANGUAGE_JSON_KEY_TO_PRISMA_CODE[t];
  if (prismaCode && LANGUAGE_VALUE_SET.has(prismaCode)) {
    return prismaCode as Language;
  }
  return null;
}

/** 노출·정렬 시 사용하는 Prisma 언어 코드 순서 */
export const PRISMA_LANGUAGE_SORT_ORDER: readonly string[] = [
  'ja',
  'ko',
  'en',
  'zhCN',
  'zhTW',
  'th',
  'vi',
  'ru',
];

/** Prisma/문자열 언어 코드 → 한글 표시명 (없으면 코드 그대로) */
export function getLanguageLabelKo(code: string): string {
  return LANGUAGE_CODE_LABEL_KO[code as Language] ?? code;
}

const prismaLanguageSortRank = (code: string): number => {
  const i = PRISMA_LANGUAGE_SORT_ORDER.indexOf(code);
  return i === -1 ? PRISMA_LANGUAGE_SORT_ORDER.length : i;
};

/**
 * `general_info.useLanguage` JSON에서 `true`인 항목만,
 * JSON 키(ja, zhCN …) → 한글 표시명 Record (정렬: {@link PRISMA_LANGUAGE_SORT_ORDER})
 *
 * @example { ja: true, en: true, zhCN: true, ko: false } → { ja: '일본어', en: '영어', zhCN: '중국어(간체)' }
 */
export function buildEnabledUseLanguageLabelsKo(raw: unknown): Record<string, string> {
  if (raw === null || raw === undefined || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  const entries: { jsonKey: string; prismaCode: string; label: string }[] = [];
  for (const [jsonKey, value] of Object.entries(raw as Record<string, unknown>)) {
    if (value !== true) continue;
    const prismaCode = USE_LANGUAGE_JSON_KEY_TO_PRISMA_CODE[jsonKey];
    if (!prismaCode) continue;
    entries.push({ jsonKey, prismaCode, label: getLanguageLabelKo(prismaCode) });
  }
  entries.sort((a, b) => prismaLanguageSortRank(a.prismaCode) - prismaLanguageSortRank(b.prismaCode));
  return Object.fromEntries(entries.map((e) => [e.jsonKey, e.label]));
}
