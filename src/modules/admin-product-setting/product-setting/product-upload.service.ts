import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { SettingService } from '@src/core/setting/setting.service';
import { Language } from '@prisma/client';
import { CustomException } from '@common/exceptions';
import * as ExcelJS from 'exceljs';

interface ParsedProduct {
  groupCode: string;
  price: number;
  eventPrice: number | null;
  startDate: string | null;
  endDate: string | null;
  productDetailInfoCode: string | null;
  translations: {
    language: Language;
    name: string | null;
    description: string | null;
    imageCode: string | null;
    isView: boolean;
  }[];
}

@Injectable()
export class ProductUploadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingService: SettingService,
  ) {}

  private getAllLanguages(): Language[] {
    const defaultLang = this.settingService.getDefaultLanguage() as Language;
    const publicLang = this.settingService.getPublicLanguage() as Language;
    const siteLangs = this.settingService.getSiteUseLanguages() as Language[];
    const set = new Set<Language>([defaultLang, publicLang, ...siteLangs]);
    return Array.from(set);
  }

  async uploadProducts(buffer: Buffer): Promise<{ total: number; success: number; errors: { row: number; message: string }[] }> {
    const langs = this.getAllLanguages();
    const defaultLang = this.settingService.getDefaultLanguage() as Language;
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer as any);

    const ws = wb.getWorksheet('상품 업로드') || wb.getWorksheet(1);
    if (!ws) throw new CustomException('엑셀 파일에 "상품 업로드" 시트가 없습니다.', 'BAD_REQUEST');

    // 헤더 → 컬럼 인덱스 매핑
    const headerRow = ws.getRow(1);
    const colMap: Record<string, number> = {};
    headerRow.eachCell((cell, colNumber) => {
      const val = String(cell.value ?? '').trim();
      if (val) colMap[val] = colNumber;
    });

    const langColMap: Record<string, { name: number; desc: number; view: number }> = {};
    for (const l of langs) {
      const label = this.getLangDisplay(l);
      langColMap[l] = {
        name: colMap[`상품명-${label}`] ?? 0,
        desc: colMap[`상품설명-${label}`] ?? 0,
        view: colMap[`노출여부-${label}`] ?? 0,
      };
    }

    const priceCol = colMap['정상가'] ?? 0;
    const eventPriceCol = colMap['이벤트가'] ?? 0;
    const startDateCol = colMap['상품노출 시작일'] ?? 0;
    const endDateCol = colMap['상품노출 종료일'] ?? 0;
    const opCodeCol = colMap['상세페이지코드'] ?? 0;
    const groupCodeCol = colMap['분류코드'] ?? 0;
    const imageCodeCol = colMap['이미지코드'] ?? 0;

    // 참조 데이터 로드
    const detailInfoMap = new Map<string, number>();
    const detailInfos = await this.prisma.productDetailInfo.findMany({
      where: { deletedAt: null }, select: { id: true, code: true },
    });
    for (const info of detailInfos) detailInfoMap.set(info.code, info.id);

    // ── 1단계: 파싱 + 검증 ──
    const parsed: { rowNum: number; data: ParsedProduct }[] = [];
    const errors: { row: number; message: string }[] = [];

    ws.eachRow((row, rowNumber) => {
      if (rowNumber <= 1) return;
      const priceVal = this.cellVal(row, priceCol);
      const nameVal = langColMap[defaultLang]?.name ? this.cellVal(row, langColMap[defaultLang].name) : '';
      if (!priceVal && !nameVal) return;

      const rowErrors: string[] = [];

      const price = Number(priceVal);
      if (!priceVal || isNaN(price)) rowErrors.push('정상가는 필수이며 숫자여야 합니다.');
      if (!nameVal) rowErrors.push(`기준언어(${defaultLang}) 상품명은 필수입니다.`);

      const eventPriceRaw = this.cellVal(row, eventPriceCol);
      const eventPrice = eventPriceRaw ? Number(eventPriceRaw) : null;
      if (eventPriceRaw && isNaN(eventPrice as number)) rowErrors.push('이벤트가는 숫자여야 합니다.');

      const opCode = this.cellVal(row, opCodeCol) || null;
      if (opCode && !detailInfoMap.has(opCode)) rowErrors.push(`상세페이지코드 "${opCode}"가 존재하지 않습니다.`);

      if (rowErrors.length > 0) {
        errors.push({ row: rowNumber, message: rowErrors.join(' / ') });
        return;
      }

      const imageCode = this.cellVal(row, imageCodeCol) || null;
      const translations: ParsedProduct['translations'] = [];
      for (const l of langs) {
        const cols = langColMap[l];
        if (!cols) continue;
        translations.push({
          language: l as Language,
          name: this.cellVal(row, cols.name) || null,
          description: this.cellVal(row, cols.desc) || null,
          imageCode,
          isView: this.cellVal(row, cols.view)?.toUpperCase() !== 'N',
        });
      }

      parsed.push({
        rowNum: rowNumber,
        data: {
          groupCode: this.cellVal(row, groupCodeCol) || '',
          price,
          eventPrice,
          startDate: this.cellVal(row, startDateCol) || null,
          endDate: this.cellVal(row, endDateCol) || null,
          productDetailInfoCode: opCode,
          translations,
        },
      });
    });

    if (parsed.length === 0 && errors.length === 0) {
      throw new CustomException('등록할 상품 데이터가 없습니다.', 'BAD_REQUEST');
    }

    // 이미지코드 유효성 검증
    const allImageCodes = new Set<string>();
    for (const item of parsed) {
      for (const t of item.data.translations) {
        if (t.imageCode) allImageCodes.add(t.imageCode);
      }
    }
    const validImageCodes = new Set<string>();
    if (allImageCodes.size > 0) {
      const images = await this.prisma.generalImage.findMany({
        where: { code: { in: Array.from(allImageCodes) } },
        select: { code: true },
      });
      for (const img of images) validImageCodes.add(img.code);
    }
    for (const item of parsed) {
      const invalidCodes: string[] = [];
      for (const t of item.data.translations) {
        if (t.imageCode && !validImageCodes.has(t.imageCode)) {
          invalidCodes.push(t.imageCode);
        }
      }
      if (invalidCodes.length > 0) {
        errors.push({ row: item.rowNum, message: `존재하지 않는 이미지코드: ${invalidCodes.join(', ')}` });
      }
    }

    // ── 에러가 하나라도 있으면 insert 하지 않고 에러만 반환 ──
    if (errors.length > 0) {
      errors.sort((a, b) => a.row - b.row);
      return { total: parsed.length + errors.length, success: 0, errors };
    }

    // ── 2단계: 전체 검증 통과 → 일괄 등록 ──
    await this.prisma.$transaction(async (tx) => {
      for (const item of parsed) {
        let productDetailInfoId: number | null = null;
        if (item.data.productDetailInfoCode) {
          productDetailInfoId = detailInfoMap.get(item.data.productDetailInfoCode) ?? null;
        }

        const product = await tx.product.create({
          data: {
            productPrice: item.data.price,
            eventPrice: item.data.eventPrice,
            startDate: item.data.startDate,
            endDate: item.data.endDate,
            isActive: true,
            productDetailInfoId,
            changedKeys: [],
          },
        });
        for (const t of item.data.translations) {
          if (t.name || t.language === defaultLang) {
            await tx.productTranslation.create({
              data: {
                productId: product.id,
                language: t.language,
                name: t.name,
                description: t.description,
                imageCode: t.imageCode && validImageCodes.has(t.imageCode) ? t.imageCode : null,
                isView: t.isView,
                isMatch: true,
                lastChangedAt: new Date(),
              },
            });
          }
        }
      }
    });

    return { total: parsed.length, success: parsed.length, errors: [] };
  }

  private cellVal(row: ExcelJS.Row, col: number): string {
    if (!col) return '';
    const cell = row.getCell(col);
    if (cell.value == null) return '';
    if (cell.value instanceof Date) {
      return cell.value.toISOString().split('T')[0];
    }
    return String(cell.value).trim();
  }

  private getLangDisplay(lang: string): string {
    const map: Record<string, string> = {
      ko: '한국어(KR)', ja: '일본어(JPN)', en: '영어(EN)',
      zhCN: '중국어간체(CHN)', zhTW: '중국어번체(CHN-TW)',
      th: '태국어(TH)', ru: '러시아어(RU)', vi: '베트남어(VN)',
    };
    return map[lang] ?? lang;
  }
}
