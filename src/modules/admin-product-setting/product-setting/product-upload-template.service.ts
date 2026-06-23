import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { SettingService } from '@src/core/setting/setting.service';
import { Language } from '@prisma/client';
import * as ExcelJS from 'exceljs';

const LANG_DISPLAY: Record<string, string> = {
  ko: '한국어(KR)',
  ja: '일본어(JPN)',
  en: '영어(EN)',
  zhCN: '중국어간체(CHN)',
  zhTW: '중국어번체(CHN-TW)',
  th: '태국어(TH)',
  ru: '러시아어(RU)',
  vi: '베트남어(VN)',
};

const SAMPLE_NAMES: Record<string, string[]> = {
  ko: ['리프팅 시술', '보톡스 시술', '필러 시술', '피부 관리', '레이저 토닝', '울쎄라 리프팅', '인모드 시술', '슈링크 시술', '스킨 보톡스', '물광 주사'],
  ja: ['リフティング施術', 'ボトックス施術', 'フィラー施術', 'スキンケア', 'レーザートーニング', 'ウルセラリフティング', 'インモード施術', 'シュリンク施術', 'スキンボトックス', '水光注射'],
  en: ['Lifting Treatment', 'Botox Treatment', 'Filler Treatment', 'Skin Care', 'Laser Toning', 'Ulthera Lifting', 'InMode Treatment', 'Shrink Treatment', 'Skin Botox', 'Skin Booster'],
  zhCN: ['提升术', '肉毒素', '填充剂', '皮肤管理', '激光嫩肤', '超声刀提升', 'InMode治疗', '热玛吉', '水光针', '皮肤注射'],
  zhTW: ['提升術', '肉毒桿菌', '填充劑', '皮膚管理', '雷射嫩膚', '超聲刀提升', 'InMode治療', '熱瑪吉', '水光針', '皮膚注射'],
  th: ['ลิฟติ้ง', 'โบท็อกซ์', 'ฟิลเลอร์', 'ดูแลผิว', 'เลเซอร์โทนนิ่ง', 'อัลเธร่า', 'อินโหมด', 'ชริ้งค์', 'สกินโบท็อกซ์', 'วอเตอร์ชายน์'],
  ru: ['Лифтинг', 'Ботокс', 'Филлер', 'Уход за кожей', 'Лазерный тонинг', 'Ультера', 'ИнМоуд', 'Шринк', 'Скин Ботокс', 'Мезотерапия'],
  vi: ['Nâng cơ', 'Botox', 'Filler', 'Chăm sóc da', 'Laser Toning', 'Ulthera', 'InMode', 'Shrink', 'Skin Botox', 'Tiêm dưỡng ẩm'],
};

const SAMPLE_PRICES = [150000, 200000, 300000, 80000, 120000, 500000, 350000, 400000, 180000, 250000];
const SAMPLE_EVENT_PRICES = [120000, null, 250000, 60000, null, 400000, null, 350000, 150000, null];

@Injectable()
export class ProductUploadTemplateService {
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

  async generateTemplate(): Promise<ExcelJS.Buffer> {
    const langs = this.getAllLanguages();
    const groups = await this.prisma.productGroup.findMany({ orderBy: { code: 'asc' } });
    const detailInfos = await this.prisma.productDetailInfo.findMany({
      where: { deletedAt: null },
      select: { code: true },
      orderBy: { code: 'asc' },
    });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('상품 업로드');

    // ── 컬럼 순서: 공통 → 언어별(상품명, 설명, 이미지코드, 노출여부) ──
    const headers: { header: string; key: string; width: number }[] = [
      { header: '분류코드', key: 'groupCode', width: 22 },
      { header: '정상가', key: 'price', width: 12 },
      { header: '이벤트가', key: 'eventPrice', width: 12 },
      { header: '상품노출 시작일', key: 'startDate', width: 18 },
      { header: '상품노출 종료일', key: 'endDate', width: 18 },
      { header: '상세페이지코드', key: 'productDetailInfoCode', width: 20 },
    ];
    for (const l of langs) headers.push({ header: `상품명-${LANG_DISPLAY[l] ?? l}`, key: `name_${l}`, width: 24 });
    for (const l of langs) headers.push({ header: `상품설명-${LANG_DISPLAY[l] ?? l}`, key: `desc_${l}`, width: 30 });
    for (const l of langs) headers.push({ header: `이미지코드-${LANG_DISPLAY[l] ?? l}`, key: `image_${l}`, width: 22 });
    for (const l of langs) headers.push({ header: `노출여부-${LANG_DISPLAY[l] ?? l}`, key: `view_${l}`, width: 14 });

    ws.columns = headers;

    // 헤더 스타일
    const headerRow = ws.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true, size: 11 };
      const isCommon = colNumber <= 6;
      cell.fill = {
        type: 'pattern', pattern: 'solid',
        fgColor: { argb: isCommon ? 'FFE2EFDA' : 'FFDCE6F1' },
      };
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    });
    headerRow.height = 32;

    // ── 예시 10건 ──
    const groupCode = groups[0]?.code ?? 'GRP_20260622_0001';
    const detailInfoCode = detailInfos[0]?.code ?? '';

    for (let i = 0; i < 10; i++) {
      const row: Record<string, any> = {
        groupCode,
        price: SAMPLE_PRICES[i],
        eventPrice: SAMPLE_EVENT_PRICES[i] ?? '',
        startDate: '2026-01-01',
        endDate: i % 3 === 0 ? '' : '2026-12-31',
        productDetailInfoCode: i < 3 ? detailInfoCode : '',
      };
      for (const l of langs) {
        const names = SAMPLE_NAMES[l] ?? SAMPLE_NAMES['en'];
        row[`name_${l}`] = names[i] ?? `상품 ${i + 1}`;
        row[`desc_${l}`] = i < 3 ? `${names[i] ?? ''} 설명` : '';
        row[`image_${l}`] = l === langs[0] && i < 3 ? `IMG0000000${i + 1}` : '';
        row[`view_${l}`] = 'Y';
      }
      ws.addRow(row);
    }

    // 데이터 행 스타일 (예시임을 표현)
    for (let r = 2; r <= 11; r++) {
      const row = ws.getRow(r);
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' },
        };
        cell.alignment = { vertical: 'middle' };
      });
      row.font = { color: { argb: 'FF888888' }, italic: true };
    }

    // 분류코드 드롭다운
    if (groups.length > 0) {
      const formulae = [`"${groups.map((g) => g.code).join(',')}"`];
      for (let r = 2; r <= 200; r++) {
        ws.getCell(r, 1).dataValidation = {
          type: 'list', allowBlank: true, formulae,
          showErrorMessage: true, errorTitle: '분류코드 오류', error: '등록된 분류코드 중 선택하세요.',
        };
      }
    }

    // 노출여부 드롭다운 (Y/N) — 공통6 + 상품명(langs) + 상품설명(langs) + 이미지코드(langs) 뒤
    const viewColStart = 6 + langs.length * 3 + 1;
    for (let li = 0; li < langs.length; li++) {
      const col = viewColStart + li;
      for (let r = 2; r <= 200; r++) {
        ws.getCell(r, col).dataValidation = {
          type: 'list', allowBlank: true, formulae: ['"Y,N"'],
          showErrorMessage: true, errorTitle: '노출여부', error: 'Y 또는 N을 입력하세요.',
        };
      }
    }

    // ── 참조 시트: 분류코드 ──
    const refSheet = wb.addWorksheet('참조-분류코드');
    refSheet.columns = [
      { header: '분류코드', key: 'code', width: 24 },
      { header: '분류명', key: 'name', width: 30 },
    ];
    refSheet.getRow(1).font = { bold: true };
    refSheet.getRow(1).eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };
    });
    for (const g of groups) refSheet.addRow({ code: g.code, name: g.name });

    // ── 참조 시트: 상세페이지코드 ──
    const refSheet2 = wb.addWorksheet('참조-상세페이지코드');
    refSheet2.columns = [{ header: '상세페이지코드', key: 'code', width: 24 }];
    refSheet2.getRow(1).font = { bold: true };
    refSheet2.getRow(1).eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };
    });
    for (const info of detailInfos) refSheet2.addRow({ code: info.code });

    return await wb.xlsx.writeBuffer();
  }
}
