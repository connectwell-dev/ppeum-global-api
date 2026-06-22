import { Language } from "@prisma/client";

/**
 * 번역 배열에서 특정 필드 값을 lang → defaultLang 순으로 fallback하여 반환
 *
 * @example
 * pickTranslation(translations, 'name', lang, defaultLang)
 * pickTranslation(translations, 'title', lang, defaultLang)
 */
export const pickTranslation = <T extends { language: string, [key: string]: any }>(
  translations: T[] = [],
  field: keyof Omit<T, 'language'>,
  lang: Language,
  defaultLang: Language,
): any =>
  (translations.find((t) => t.language === lang)?.[field] as any | undefined) ||
  (translations.find((t) => t.language === defaultLang)?.[field] as any | undefined) ||
  undefined;

/**
 * 다국어 맵({ [lang]: value }) 에서 우선순위(lang → defaultLang → 첫 값) 로 값 추출
 * - 스냅샷에 저장된 Json 형태 ({ ja: '...', ko: '...' } 등) 처럼 배열이 아닌 맵 형태에 사용
 */
export function pickLangFromMap(
  obj: Record<string, string> | null | undefined,
  lang: string,
  defaultLang: string,
): string {
  if (!obj) return '';
  return obj[lang] || obj[defaultLang] || Object.values(obj)[0] || '';
}
