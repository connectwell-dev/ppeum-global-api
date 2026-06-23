import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { CustomException } from '@common/exceptions';
import { CommonSetResponseDto } from '@common/dto/common-response.dto';
import { SettingService } from '@src/core/setting/setting.service';
import { PaginatedResponseDto } from '@common/dto/pagination.dto';
import { GetProductDetailInfoListReqDto } from './dto/get-product-detail-info/query.dto';
import { SetProductDetailInfoDefaultTranslationDto, SetProductDetailInfoTranslationDto } from './dto/set-product-detail-info/request.dto';
import { GetProductDetailInfoDetailResDto, GetProductDetailInfoListResDto } from './dto/get-product-detail-info/response.dto';
import { GetProductDetailInfoOperationListResDto } from './dto/get-product-detail-info-operation/response.dto';
import { SetProductDetailInfoReqDto } from './dto/set-product-detail-info/request.dto';
import { PutProductDetailInfoPublicTranslationReqDto, PutProductDetailInfoReqDto, PutProductDetailInfoTranslationReqDto } from './dto/put-product-detail-info/request.dto';
import { PRODUCT_DETAIL_INFO_DESCRIPTION_DEFAULT } from './constants/product-detail-info-description-default';
import { changedKeyFind, changeWordFind, notMatchKeyFind, ChangedKey, fillTranslationValue } from '@common/utils/changed-key-find';
import { ProductDetailInfoTranslation, Language } from '@prisma/client';
import { ERROR_MESSAGE } from '@common/constants/error-message';
import { pickTranslation } from '@common/utils/translation-utils';
@Injectable()
export class ProductDetailInfoSettingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingService: SettingService,
  ) { }
  findKeys = [
    { key: 'title', defaultValue: '' },
    { key: 'description', defaultValue: '' },
    { key: 'shortDescription', defaultValue: [{}] },
    { key: 'imageCode', defaultValue: '' },
    { key: 'hashtag', defaultValue: [] },
    { key: 'caution', defaultValue: [] },
    { key: 'note', defaultValue: '' },
  ]

  async duplicateTitleCheck(title: string, language: Language, productDetailInfoId?: number, isSet: boolean = true): Promise<void> {
    const duplicateProductDetailInfo = await this.prisma.productDetailInfoTranslation.findFirst({
      where: {
        title,
        language,
        productDetailInfo: { deletedAt: null },
        ...(productDetailInfoId ? { productDetailInfoId: { not: productDetailInfoId } } : {}),
      },
    });
    if (duplicateProductDetailInfo) throw new CustomException('productDetail.info.title.duplicate', 'BAD_REQUEST', {
      field: `${isSet ? language + '.' : ''}title`, fieldMessage: 'productDetail.info.title.duplicate'
    });
  }


  // ───────────────────────────────────────────────
  // 공통: 연결된 상품 목록
  // ───────────────────────────────────────────────
  async getProductDetailInfoOperationList(id: number, headerLang?: Language): Promise<GetProductDetailInfoOperationListResDto[]> {
    const defaultLang = this.settingService.getDefaultLanguage() as Language;
    const products = await this.prisma.product.findMany({
      where: { productDetailInfoId: id, deletedAt: null },
      include: {
        productTranslations: { where: { language: { in: [headerLang, defaultLang] } }, select: { language: true, name: true } },
      },
    });
    return products.map((p) => ({
      id: p.id,
      name: pickTranslation(p.productTranslations ?? [], 'name', headerLang, defaultLang) ?? null,
      categoryName: null,
    }));
  }

  // ───────────────────────────────────────────────
  // 공통: 다국어 번역 일괄 조회 (N+1 방지용)
  // ───────────────────────────────────────────────
  private async findAllProductDetailInfoTranslations(id: number): Promise<{ [lang: string]: any }> {
    try {
      const info = await this.prisma.productDetailInfo.findUnique({
        where: { id, deletedAt: null },
        include: {
          productDetailInfoTranslations: {
            include: {
              image: true,
            },
          },
        },
      });
      if (!info) return {};
      const result: { [lang: string]: any } = {};
      for (const translation of info.productDetailInfoTranslations) {
        const { productDetailInfoId, language, image, ...translationData } = translation as any;
        result[language] = { ...translationData, id: info.id, code: info.code, changedKeys: info.changedKeys, createdAt: info.createdAt, updatedAt: info.updatedAt, image: image };
      }
      return result;
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  // ───────────────────────────────────────────────
  // 리스트 조회
  // ───────────────────────────────────────────────
  async getProductDetailInfoList(dto: GetProductDetailInfoListReqDto, headerLang?: Language): Promise<PaginatedResponseDto<GetProductDetailInfoListResDto>> {
    headerLang = headerLang ?? this.settingService.getDefaultLanguage() as Language;
    try {
      const { title, notInputLanguage, hashtag } = dto;
      const page = dto.page ?? 1;
      const rowCount = dto.rowCount ?? 10;

      const titleFilter = title
        ? { productDetailInfoTranslations: { some: { language: headerLang, title: { contains: title } } } }
        : {};

      const hashtagFilter = hashtag
        ? { productDetailInfoTranslations: { some: { language: headerLang, hashtag: { hasSome: [hashtag] } } } }
        : {};

      const notInputFilter = notInputLanguage
        ? {
          OR: [
            { NOT: { productDetailInfoTranslations: { some: { language: notInputLanguage } } } },
            { productDetailInfoTranslations: { some: { language: notInputLanguage, isMatch: false } } },
          ],
        }
        : {};

      if (notInputLanguage === this.settingService.getDefaultLanguage()) { return { total: 0, page: 1, totalPage: 1, data: [] }; }

      const where = { deletedAt: null, ...titleFilter, ...hashtagFilter, ...notInputFilter };

      const [total, data] = await Promise.all([
        this.prisma.productDetailInfo.count({ where }),
        this.prisma.productDetailInfo.findMany({
          where,
          include: {
            productDetailInfoTranslations: { select: { language: true, title: true, hashtag: true, note: true, updatedAt: true, isMatch: true } },
          },
          skip: (page - 1) * rowCount,
          take: rowCount,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const totalPage = Math.ceil(total / rowCount) || 1;

      const result: GetProductDetailInfoListResDto[] = data.map((item) => {
        let notInputLanguages: Language[] = [];
        for (const lang of [...this.settingService.getSiteUseLanguages(), this.settingService.getPublicLanguage()]) {
          if (!item.productDetailInfoTranslations.find(t => t.language === lang)) notInputLanguages.push(lang as Language);
          else {
            const translation: ProductDetailInfoTranslation = item.productDetailInfoTranslations.find(t => t.language === lang) as ProductDetailInfoTranslation;
            if (!translation.isMatch) notInputLanguages.push(lang as Language);
          }
        }
        const defaultLang = this.settingService.getDefaultLanguage() as Language;
        return {
          id: item.id,
          code: item.code,
          title: pickTranslation(item.productDetailInfoTranslations ?? [], 'title', headerLang, defaultLang) ?? '',
          hashtag: pickTranslation(item.productDetailInfoTranslations ?? [], 'hashtag', headerLang, defaultLang) ?? [],
          note: pickTranslation(item.productDetailInfoTranslations ?? [], 'note', headerLang, defaultLang) ?? '',
          notInputLanguages: notInputLanguages,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };
      });
      return { total, page, totalPage, data: result };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  // ───────────────────────────────────────────────
  // 상세 조회
  // ───────────────────────────────────────────────
  async getProductDetailInfoDetail(id: number, language?: Language, headerLang?: Language): Promise<any> {
    language = language ?? this.settingService.getDefaultLanguage() as Language;
    headerLang = headerLang ?? this.settingService.getDefaultLanguage() as Language;
    try {
      const allDbProductDetailInfo = await this.findAllProductDetailInfoTranslations(id);
      const dbProductDetailInfo: any = allDbProductDetailInfo[language as Language];
      let notMatchKeys: { key: string, message: string }[] = [];
      if (language !== this.settingService.getDefaultLanguage()) {
        const defaultDbProductDetailInfo = allDbProductDetailInfo[this.settingService.getDefaultLanguage() as Language];
        if (!defaultDbProductDetailInfo) throw new CustomException('productDetail.info.not_found', 'BAD_REQUEST');
        notMatchKeys = notMatchKeyFind(defaultDbProductDetailInfo, dbProductDetailInfo ?? {}, this.findKeys);
        notMatchKeys = notMatchKeys.map(item => ({ ...item, message: ERROR_MESSAGE[item.message]?.[headerLang] }));
        const refDate = dbProductDetailInfo?.lastChangedAt ?? new Date(0);
        const changedKeys = (defaultDbProductDetailInfo.changedKeys as ChangedKey[] || []).filter(key => new Date(key.changedAt) > new Date(refDate));
        changedKeys.forEach(item => {
          const isExistKey = notMatchKeys.find(key => key.key === item.key);
          if (!isExistKey) {
            notMatchKeys.push({ key: item.key, message: ERROR_MESSAGE['common.translation_not_updated']?.[headerLang] });
          }
        });
        notMatchKeys.sort((a, b) => a.key.localeCompare(b.key));
      } else {
        if (!dbProductDetailInfo) throw new CustomException('productDetail.info.not_found', 'BAD_REQUEST');
      }
      if (dbProductDetailInfo) delete dbProductDetailInfo.changedKeys;
      const result = dbProductDetailInfo ?? {};
      result.notMatchKeys = notMatchKeys;
      return result;
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  // ───────────────────────────────────────────────
  // 등록
  // ───────────────────────────────────────────────

  async setProductDetailInfo(dto: SetProductDetailInfoReqDto): Promise<CommonSetResponseDto> {
    try {
      const defaultLang = this.settingService.getDefaultLanguage();
      const publicLang = this.settingService.getPublicLanguage();
      const siteUseLanguages = this.settingService.getSiteUseLanguages();
      const otherLanguageData: { language: Language; data: SetProductDetailInfoDefaultTranslationDto }[] = [publicLang, ...siteUseLanguages].filter((language) => language !== defaultLang).map((language) => ({ language: language as Language, data: (dto[language]) ? JSON.parse(JSON.stringify(dto[language] ?? undefined)) : null }));
      const defaultLanguageData: SetProductDetailInfoDefaultTranslationDto = (dto[defaultLang]) ? JSON.parse(JSON.stringify(dto[defaultLang] ?? undefined)) : null;
      let notMatchKeys: { key: string, message: string }[] = [];
      let validateObj: { [key: string]: any } = {};

      await Promise.all(
        Object.keys(dto)
          .filter(key => dto[key]?.title)
          .map(key => this.duplicateTitleCheck(dto[key].title, key as Language))
      );

      validateObj[defaultLang] = fillTranslationValue(dto[defaultLang], defaultLanguageData, this.findKeys);

      for (const { language, data } of [...otherLanguageData, { language: defaultLang as Language, data: defaultLanguageData }]) {
        if (!data) continue;
        const notDefaultShortDescription = PRODUCT_DETAIL_INFO_DESCRIPTION_DEFAULT[language as keyof typeof PRODUCT_DETAIL_INFO_DESCRIPTION_DEFAULT].filter((key) => !Object.values(data.shortDescription ?? []).map((item) => item.key).includes(key));
        if (notDefaultShortDescription.length > 0) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: `${language} 언어의 상세페이지 설명2에 부족한 항목이 있습니다` });
        if (language === defaultLang) continue;

        validateObj[language] = fillTranslationValue(dto[defaultLang], data, this.findKeys);

        notMatchKeys[language] = notMatchKeyFind(validateObj[defaultLang], validateObj[language], this.findKeys);
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const createdAt = new Date();
        const info = await tx.productDetailInfo.create({ data: { createdAt, updatedAt: createdAt } });
        await tx.productDetailInfoTranslation.create({
          data: {
            productDetailInfoId: info.id,
            language: defaultLang as Language,
            title: validateObj[defaultLang].title || null,
            description: validateObj[defaultLang].description || null,
            shortDescription: (validateObj[defaultLang].shortDescription || []) as any,
            imageCode: validateObj[defaultLang].imageCode || null,
            hashtag: validateObj[defaultLang].hashtag || [],
            caution: validateObj[defaultLang].caution || [],
            note: validateObj[defaultLang].note || null,
            isMatch: true,
          },
        });


        for (const { language, data } of otherLanguageData) {
          if (!data) continue;
          let translationDate = createdAt;
          const notFilledList = notMatchKeys[language].filter(item => item.message == 'common.translation_not_filled');
          if (notFilledList && notFilledList.length > 0) translationDate = new Date(translationDate.getTime() - 1000);
          await tx.productDetailInfoTranslation.create({
            data: {
              productDetailInfoId: info.id,
              language,
              title: validateObj[language].title || null,
              description: validateObj[language].description || null,
              shortDescription: (validateObj[language].shortDescription || []) as any,
              imageCode: validateObj[language].imageCode || null,
              hashtag: validateObj[language].hashtag || [],
              caution: validateObj[language].caution || [],
              note: validateObj[language].note || null,
              isMatch: (notFilledList && notFilledList.length > 0) ? false : true,
              createdAt: translationDate,
              updatedAt: translationDate,
            },
          });
        }
        return info;
      });
      return { id: result.id };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  // ───────────────────────────────────────────────
  // 기준언어 수정
  // ───────────────────────────────────────────────
  async putProductDetailInfo(id: number, dto: PutProductDetailInfoReqDto): Promise<string> {
    try {
      const defaultLang = this.settingService.getDefaultLanguage();
      const publicLang = this.settingService.getPublicLanguage();
      const siteUseLanguages = this.settingService.getSiteUseLanguages();
      const notDefaultShortDescription = PRODUCT_DETAIL_INFO_DESCRIPTION_DEFAULT[defaultLang as Language].filter((key) => !Object.values(dto.shortDescription ?? []).map((item) => item.key).includes(key));
      if (notDefaultShortDescription.length > 0) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: `${defaultLang} 언어의 상세페이지 설명2에 부족한 항목이 있습니다` });
      await this.duplicateTitleCheck(dto.title, defaultLang as Language, id, false);
      const defaultLanguageData: SetProductDetailInfoDefaultTranslationDto = (dto) ? JSON.parse(JSON.stringify(dto ?? undefined)) : null;
      const allDbProductDetailInfo = await this.findAllProductDetailInfoTranslations(id);
      const defaultDbProductDetailInfo = allDbProductDetailInfo[defaultLang as Language];
      const otherDbProductDetailInfo: { [key: string]: any } = {};
      Object.entries(allDbProductDetailInfo).forEach(([lang, item]) => {
        if (lang !== defaultLang) otherDbProductDetailInfo[lang] = item;
      });

      let validateObj: { [key: string]: any } = {};
      let notMatchKeys: { key: string, message: string }[] = [];
      let changedKeys: ChangedKey[] = JSON.parse(JSON.stringify(defaultDbProductDetailInfo.changedKeys)) || [];

      notMatchKeys[defaultLang] = notMatchKeyFind(defaultDbProductDetailInfo, dto, this.findKeys);
      let newChangedKeys: ChangedKey[] = changedKeys.filter(key => !notMatchKeys[defaultLang].some(item => item.key === key.key && item.message == 'common.translation_not_filled')) || [];


      validateObj[defaultLang] = (!dto.isSimpleChange) ? changedKeyFind(defaultDbProductDetailInfo, defaultLanguageData, this.findKeys) : dto;

      validateObj[defaultLang] = fillTranslationValue(dto, validateObj[defaultLang], this.findKeys, newChangedKeys);

      const { newData, addChangedKeys } = changeWordFind(validateObj[defaultLang]);
      validateObj[defaultLang] = newData;
      if (!dto.isSimpleChange) {
        newChangedKeys = newChangedKeys.filter(key => !addChangedKeys.some(item => item.key === key.key));
        newChangedKeys.push(...addChangedKeys);
      }
      newChangedKeys = newChangedKeys.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());

      for (const lang of [publicLang, ...siteUseLanguages]) {
        const translationData = otherDbProductDetailInfo[lang];
        if (!translationData) continue;

        validateObj[lang] = fillTranslationValue(dto, translationData, this.findKeys);
        validateObj[lang].lastChangedAt = translationData.lastChangedAt;

        notMatchKeys[lang] = notMatchKeyFind(validateObj[defaultLang], validateObj[lang], this.findKeys);
      }

      const changeKeyLastDate: Date | undefined = newChangedKeys[0] ? new Date(newChangedKeys[0].changedAt) : undefined;

      await this.prisma.$transaction(async (tx) => {
        for (const lang of Object.keys(validateObj)) {
          await tx.productDetailInfoTranslation.update({
            where: { productDetailInfoId_language: { productDetailInfoId: id, language: lang as Language } },
            data: {
              title: validateObj[lang].title || null,
              description: validateObj[lang].description || null,
              shortDescription: (validateObj[lang].shortDescription ?? []) as any,
              imageCode: validateObj[lang].imageCode || null,
              hashtag: validateObj[lang].hashtag || [],
              caution: validateObj[lang].caution || [],
              note: validateObj[lang].note || null,
              lastChangedAt: (lang !== defaultLang) ? validateObj[lang].lastChangedAt : new Date(),
              isMatch: (((addChangedKeys.length > 0 && !dto.isSimpleChange) || notMatchKeys[lang].length > 0 || validateObj[lang].lastChangedAt < changeKeyLastDate) && lang !== defaultLang) ? false : true,
            },
          });
        }
        await tx.productDetailInfo.update({
          where: { id },
          data: {
            changedKeys: newChangedKeys
          },
        });
      });
      return 'update product detail info success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }
  // ───────────────────────────────────────────────
  // 공용언어(ko) 번역 수정
  // ───────────────────────────────────────────────
  async putProductDetailInfoPublicTranslation(id: number, dto: PutProductDetailInfoPublicTranslationReqDto): Promise<string> {
    try {
      const defaultLang = this.settingService.getDefaultLanguage();
      const publicLang = this.settingService.getPublicLanguage();
      const siteUseLanguages = this.settingService.getSiteUseLanguages();
      if (publicLang as Language === defaultLang) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: '기준 언어는 이 API로 수정할 수 없습니다.' });

      const notDefaultShortDescription = PRODUCT_DETAIL_INFO_DESCRIPTION_DEFAULT[publicLang as keyof typeof PRODUCT_DETAIL_INFO_DESCRIPTION_DEFAULT]?.filter((key) => !Object.values(dto.shortDescription ?? []).map((item) => item.key).includes(key));
      if (notDefaultShortDescription && notDefaultShortDescription.length > 0) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: `${publicLang} 언어의 상세페이지 설명2에 부족한 항목이 있습니다` });

      if (dto.title) await this.duplicateTitleCheck(dto.title, publicLang as Language, id, false);

      const allDbProductDetailInfo = await this.findAllProductDetailInfoTranslations(id);
      const defaultDbProductDetailInfo = allDbProductDetailInfo[defaultLang as Language];
      const publicDbProductDetailInfo = allDbProductDetailInfo[publicLang as Language];

      if (!defaultDbProductDetailInfo) throw new CustomException('common.not_found', 'BAD_REQUEST');

      let publicLanguageData: SetProductDetailInfoDefaultTranslationDto = (dto) ? JSON.parse(JSON.stringify(dto ?? undefined)) : null;
      let newChangedKeys: ChangedKey[] = JSON.parse(JSON.stringify(defaultDbProductDetailInfo.changedKeys ?? []));
      let isMatchWhere: { isMatch: boolean } | undefined = undefined;
      if (!dto.isSimpleChange) {
        const publicNotMatchKeys = notMatchKeyFind(defaultDbProductDetailInfo, publicLanguageData, this.findKeys);
        if (publicNotMatchKeys.length > 0) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: '공용언어 번역 데이터에 부족한 항목이 있습니다', field: publicNotMatchKeys[0].key, fieldMessage: publicNotMatchKeys[0].message });
        const publicChangedData = changedKeyFind(publicDbProductDetailInfo, publicLanguageData, this.findKeys, true);
        const { newData, addChangedKeys } = changeWordFind(publicChangedData);
        newChangedKeys = newChangedKeys.filter(key => !addChangedKeys.some(item => item.key === key.key));
        newChangedKeys.push(...addChangedKeys);
        newChangedKeys.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
        publicLanguageData = newData;
        if (addChangedKeys.length > 0) {
          isMatchWhere = { isMatch: false };
        }
      }


      await this.prisma.$transaction(async (tx) => {
        await tx.productDetailInfoTranslation.upsert({
          where: { productDetailInfoId_language: { productDetailInfoId: id, language: publicLang as Language } },
          update: {
            title: publicLanguageData.title || null,
            description: publicLanguageData.description || null,
            shortDescription: (publicLanguageData.shortDescription || []) as any,
            imageCode: publicLanguageData.imageCode || null,
            hashtag: publicLanguageData.hashtag || [],
            caution: publicLanguageData.caution || [],
            note: publicLanguageData.note || null,
            lastChangedAt: new Date(),
            isMatch: true,
          },
          create: {
            productDetailInfoId: id,
            language: publicLang as Language,
            title: publicLanguageData.title || null,
            description: publicLanguageData.description || null,
            shortDescription: (publicLanguageData.shortDescription || []) as any,
            imageCode: publicLanguageData.imageCode || null,
            hashtag: publicLanguageData.hashtag || [],
            caution: publicLanguageData.caution || [],
            note: publicLanguageData.note || null,
            lastChangedAt: new Date(),
            isMatch: true,
          },
        });
        if (isMatchWhere) {
          await tx.productDetailInfoTranslation.updateMany({
            where: { productDetailInfoId: id, language: { notIn: [publicLang as Language, defaultLang as Language] } },
            data: isMatchWhere,
          });
        }

        const minLastChangedAtResult = await tx.productDetailInfoTranslation.findMany({
          where: { productDetailInfoId: id, NOT: { language: defaultLang as Language } },
          orderBy: { lastChangedAt: 'asc' },
          select: { lastChangedAt: true },
        });
        const minLastChangedAt: Date | undefined = minLastChangedAtResult[0] ? new Date(minLastChangedAtResult[0].lastChangedAt) : undefined;
        if (minLastChangedAt) {
          const changedKeys = newChangedKeys.filter(key => new Date(key.changedAt) > minLastChangedAt);
          await tx.productDetailInfo.update({
            where: { id },
            data: { changedKeys },
          });
        }
      });
      return 'update product detail info public translation success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  // ───────────────────────────────────────────────
  // 기타언어 번역 수정
  // ───────────────────────────────────────────────
  async putProductDetailInfoTranslation(id: number, dto: PutProductDetailInfoTranslationReqDto): Promise<string> {
    try {
      const defaultLang = this.settingService.getDefaultLanguage();
      const publicLang = this.settingService.getPublicLanguage();
      if (dto.language === defaultLang) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: '기준 언어는 이 API로 수정할 수 없습니다.' });
      if (dto.language === publicLang) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: '공용 언어는 이 API로 수정할 수 없습니다.' });

      if (dto.title) await this.duplicateTitleCheck(dto.title, dto.language, id, false);

      const notDefaultShortDescription = PRODUCT_DETAIL_INFO_DESCRIPTION_DEFAULT[dto.language as keyof typeof PRODUCT_DETAIL_INFO_DESCRIPTION_DEFAULT]?.filter((key) => !Object.values(dto.shortDescription ?? []).map((item) => item.key).includes(key));
      if (notDefaultShortDescription && notDefaultShortDescription.length > 0) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: `${dto.language} 언어의 상세페이지 설명2에 부족한 항목이 있습니다` });

      const allDbProductDetailInfo = await this.findAllProductDetailInfoTranslations(id);
      const defaultDbProductDetailInfo = allDbProductDetailInfo[defaultLang as Language];
      if (!defaultDbProductDetailInfo) throw new CustomException('common.not_found', 'NOT_FOUND');

      await this.prisma.$transaction(async (tx) => {
        await tx.productDetailInfoTranslation.upsert({
          where: { productDetailInfoId_language: { productDetailInfoId: id, language: dto.language } },
          update: {
            title: dto.title || null,
            description: dto.description || null,
            shortDescription: (dto.shortDescription ?? []) as any,
            imageCode: dto.imageCode || null,
            hashtag: dto.hashtag || [],
            caution: dto.caution || [],
            note: dto.note || null,
            isMatch: true,
            lastChangedAt: new Date(),
          },
          create: {
            productDetailInfoId: id,
            language: dto.language,
            title: dto.title || null,
            description: dto.description || null,
            shortDescription: (dto.shortDescription || []) as any,
            imageCode: dto.imageCode || null,
            hashtag: dto.hashtag || [],
            caution: dto.caution || [],
            note: dto.note || null,
            isMatch: true,
            lastChangedAt: new Date(),
          },
        });
        const minLastChangedAtResult = await tx.productDetailInfoTranslation.findMany({
          where: { productDetailInfoId: id, NOT: { language: defaultLang as Language } },
          orderBy: { lastChangedAt: 'asc' },
          select: { lastChangedAt: true },
        });
        const minLastChangedAt: Date | undefined = minLastChangedAtResult[0] ? new Date(minLastChangedAtResult[0].lastChangedAt) : undefined;
        if (minLastChangedAt) {
          const changedKeys = defaultDbProductDetailInfo.changedKeys.filter((key: ChangedKey) => new Date(key.changedAt) > minLastChangedAt);
          await tx.productDetailInfo.update({
            where: { id },
            data: { changedKeys },
          });
        }
      });
      return 'update product detail info translation success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  // ───────────────────────────────────────────────
  // 삭제
  // ───────────────────────────────────────────────
  async deleteProductDetailInfo(id: number): Promise<string> {
    try {
      const product = await this.prisma.product.findFirst({ where: { productDetailInfoId: id, deletedAt: null } });
      if (product) throw new CustomException('common.not_deleted_condition', 'NOT_DELETED_CONDITION');
      try {
        await this.prisma.productDetailInfo.update({ where: { id }, data: { deletedAt: new Date() } });
        return 'delete product detail info success';
      } catch (error) {
        throw new CustomException('common.failed_to_delete', 'BAD_REQUEST');
      }
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }
}
