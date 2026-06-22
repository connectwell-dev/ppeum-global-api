import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { CustomException } from '@common/exceptions';
import { CommonSetResponseDto } from '@common/dto/common-response.dto';
import { SettingService } from '@src/core/setting/setting.service';
import { PaginatedResponseDto } from '@common/dto/pagination.dto';
import { GetOperationInfoListReqDto } from './dto/get-operation-info/query.dto';
import { SetOperationInfoDefaultTranslationDto, SetOperationInfoTranslationDto } from './dto/set-operation-info/request.dto';
import { GetOperationInfoDetailResDto, GetOperationInfoListResDto } from './dto/get-operation-info/response.dto';
import { GetOperationInfoOperationListResDto } from './dto/get-operation-info-operation/response.dto';
import { SetOperationInfoReqDto } from './dto/set-operation-info/request.dto';
import { PutOperationInfoPublicTranslationReqDto, PutOperationInfoReqDto, PutOperationInfoTranslationReqDto } from './dto/put-operation-info/request.dto';
import { OPERATION_INFO_DESCRIPTION_DEFAULT } from '../constants/operation-info-description-default';
import { changedKeyFind, changeWordFind, notMatchKeyFind, ChangedKey, fillTranslationValue } from '@common/utils/changed-key-find';
import { OperationInfoTranslation, Language } from '@prisma/client';
import { ERROR_MESSAGE } from '@common/constants/error-message';
import { pickTranslation } from '@common/utils/translation-utils';
@Injectable()
export class OperationInfoSettingService {
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

  async duplicateTitleCheck(title: string, language: Language, operationInfoId?: number, isSet: boolean = true): Promise<void> {
    // 삭제된거 제외
    const duplicateOperationInfo = await this.prisma.operationInfoTranslation.findFirst({
      where: {
        title,
        language,
        operationInfo: { deletedAt: null },
        ...(operationInfoId ? { operationInfoId: { not: operationInfoId } } : {}),
      },
    });
    if (duplicateOperationInfo) throw new CustomException('operation.info.title.duplicate', 'BAD_REQUEST', {
      field: `${isSet ? language + '.' : ''}title`, fieldMessage: 'operation.info.title.duplicate'
    });
  }


  // ───────────────────────────────────────────────
  // 공통: 연결된 상품 목록
  // ───────────────────────────────────────────────
  async getOperationInfoOperationList(id: number, headerLang?: Language): Promise<GetOperationInfoOperationListResDto[]> {
    const defaultLang = this.settingService.getDefaultLanguage() as Language;
    const products = await this.prisma.product.findMany({
      where: { operationInfoId: id, deletedAt: null },
      include: {
        productTranslations: { where: { language: { in: [headerLang, defaultLang] } }, select: { language: true, name: true } },
        productCategory: {
          include: {
            productCategoryTranslations: { where: { language: { in: [headerLang, defaultLang] } }, select: { language: true, name: true } },
          },
        },
      },
    });
    return products.map((p) => ({
      id: p.id,
      name: pickTranslation(p.productTranslations ?? [], 'name', headerLang, defaultLang) ?? null,
      categoryName: pickTranslation(p.productCategory?.productCategoryTranslations ?? [], 'name', headerLang, defaultLang) ?? null,
    }));
  }

  // ───────────────────────────────────────────────
  // 공통: 다국어 번역 일괄 조회 (N+1 방지용)
  // ───────────────────────────────────────────────
  private async findAllOperationInfoTranslations(id: number): Promise<{ [lang: string]: any }> {
    try {
      const info = await this.prisma.operationInfo.findUnique({
        where: { id, deletedAt: null },
        include: {
          operationInfoTranslations: {
            include: {
              image: true,
            },
          },
        },
      });
      if (!info) return {};
      const result: { [lang: string]: any } = {};
      for (const translation of info.operationInfoTranslations) {
        const { operationInfoId, language, image, ...translationData } = translation as any;
        result[language] = { ...translationData, id: info.id, changedKeys: info.changedKeys, createdAt: info.createdAt, updatedAt: info.updatedAt, image: image };
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
  async getOperationInfoList(dto: GetOperationInfoListReqDto, headerLang?: Language): Promise<PaginatedResponseDto<GetOperationInfoListResDto>> {
    headerLang = headerLang ?? this.settingService.getDefaultLanguage() as Language;
    try {
      const { title, notInputLanguage, hashtag } = dto;
      const page = dto.page ?? 1;
      const rowCount = dto.rowCount ?? 10;

      const titleFilter = title
        ? { operationInfoTranslations: { some: { language: headerLang, title: { contains: title } } } }
        : {};

      const hashtagFilter = hashtag
        ? { operationInfoTranslations: { some: { language: headerLang, hashtag: { hasSome: [hashtag] } } } }
        : {};

      const notInputFilter = notInputLanguage
        ? {
          OR: [
            // 번역 자체가 없는 경우
            { NOT: { operationInfoTranslations: { some: { language: notInputLanguage } } } },
            // 번역이 있지만 미매칭 상태인 경우
            { operationInfoTranslations: { some: { language: notInputLanguage, isMatch: false } } },
          ],
        }
        : {};

      if (notInputLanguage === this.settingService.getDefaultLanguage()) { return { total: 0, page: 1, totalPage: 1, data: [] }; }

      const where = { deletedAt: null, ...titleFilter, ...hashtagFilter, ...notInputFilter };

      const [total, data] = await Promise.all([
        this.prisma.operationInfo.count({ where }),
        this.prisma.operationInfo.findMany({
          where,
          include: {
            operationInfoTranslations: { select: { language: true, title: true, hashtag: true, note: true, updatedAt: true, isMatch: true } },
          },
          skip: (page - 1) * rowCount,
          take: rowCount,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const totalPage = Math.ceil(total / rowCount) || 1;

      const result: GetOperationInfoListResDto[] = data.map((item) => {
        let notInputLanguages: Language[] = [];
        for (const lang of [...this.settingService.getSiteUseLanguages(), this.settingService.getPublicLanguage()]) {
          if (!item.operationInfoTranslations.find(t => t.language === lang)) notInputLanguages.push(lang as Language);
          else {
            const translation: OperationInfoTranslation = item.operationInfoTranslations.find(t => t.language === lang) as OperationInfoTranslation;
            if (!translation.isMatch) notInputLanguages.push(lang as Language);
          }
        }
        const defaultLang = this.settingService.getDefaultLanguage() as Language;
        return {
          id: item.id,
          title: pickTranslation(item.operationInfoTranslations ?? [], 'title', headerLang, defaultLang) ?? '',
          hashtag: pickTranslation(item.operationInfoTranslations ?? [], 'hashtag', headerLang, defaultLang) ?? [],
          note: pickTranslation(item.operationInfoTranslations ?? [], 'note', headerLang, defaultLang) ?? '',
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
  async getOperationInfoDetail(id: number, language?: Language, headerLang?: Language): Promise<any> {
    language = language ?? this.settingService.getDefaultLanguage() as Language;
    headerLang = headerLang ?? this.settingService.getDefaultLanguage() as Language;
    try {
      const allDbOperationInfo = await this.findAllOperationInfoTranslations(id);
      const dbOperationInfo: any = allDbOperationInfo[language as Language];
      let notMatchKeys: { key: string, message: string }[] = [];
      if (language !== this.settingService.getDefaultLanguage()) {
        const defaultDbOperationInfo = allDbOperationInfo[this.settingService.getDefaultLanguage() as Language];
        if (!defaultDbOperationInfo) throw new CustomException('operation.info.not_found', 'BAD_REQUEST');
        notMatchKeys = notMatchKeyFind(defaultDbOperationInfo, dbOperationInfo ?? {}, this.findKeys);
        notMatchKeys = notMatchKeys.map(item => ({ ...item, message: ERROR_MESSAGE[item.message]?.[headerLang] }));
        const refDate = dbOperationInfo?.lastChangedAt ?? new Date(0);
        const changedKeys = (defaultDbOperationInfo.changedKeys as ChangedKey[] || []).filter(key => new Date(key.changedAt) > new Date(refDate));
        // common.translation_not_updated
        changedKeys.forEach(item => {
          const isExistKey = notMatchKeys.find(key => key.key === item.key);
          if (!isExistKey) {
            notMatchKeys.push({ key: item.key, message: ERROR_MESSAGE['common.translation_not_updated']?.[headerLang] });
          }
        });
        // notMatchKeys key 이름 순서대로 정렬
        notMatchKeys.sort((a, b) => a.key.localeCompare(b.key));
      } else {
        if (!dbOperationInfo) throw new CustomException('operation.info.not_found', 'BAD_REQUEST');
      }
      if (dbOperationInfo) delete dbOperationInfo.changedKeys;
      const result = dbOperationInfo ?? {};
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

  async setOperationInfo(dto: SetOperationInfoReqDto): Promise<CommonSetResponseDto> {
    try {
      const defaultLang = this.settingService.getDefaultLanguage();
      const publicLang = this.settingService.getPublicLanguage();
      const siteUseLanguages = this.settingService.getSiteUseLanguages();
      const otherLanguageData: { language: Language; data: SetOperationInfoDefaultTranslationDto }[] = [publicLang, ...siteUseLanguages].filter((language) => language !== defaultLang).map((language) => ({ language: language as Language, data: (dto[language]) ? JSON.parse(JSON.stringify(dto[language] ?? undefined)) : null }));
      const defaultLanguageData: SetOperationInfoDefaultTranslationDto = (dto[defaultLang]) ? JSON.parse(JSON.stringify(dto[defaultLang] ?? undefined)) : null;
      let notMatchKeys: { key: string, message: string }[] = [];
      let validateObj: { [key: string]: any } = {};

      // 시술정보명 중복 체크
      await Promise.all(
        Object.keys(dto)
          .filter(key => dto[key]?.title)
          .map(key => this.duplicateTitleCheck(dto[key].title, key as Language))
      );

      // 기준언어 먼저 채우기 및 제거 처리
      validateObj[defaultLang] = fillTranslationValue(dto[defaultLang], defaultLanguageData, this.findKeys);

      for (const { language, data } of [...otherLanguageData, { language: defaultLang as Language, data: defaultLanguageData }]) {
        if (!data) continue;
        const notDefaultShortDescription = OPERATION_INFO_DESCRIPTION_DEFAULT[language as keyof typeof OPERATION_INFO_DESCRIPTION_DEFAULT].filter((key) => !Object.values(data.shortDescription ?? []).map((item) => item.key).includes(key));
        if (notDefaultShortDescription.length > 0) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: `${language} 언어의 시술 설명2에 부족한 항목이 있습니다` });
        if (language === defaultLang) continue;

        // 번역언어들 기준언어 기반으로 채우기 및 제거 처리
        validateObj[language] = fillTranslationValue(dto[defaultLang], data, this.findKeys);

        // 번역언어들 채우기/제거 처리된 기준언어 기반으로 부족한 값 찾기
        notMatchKeys[language] = notMatchKeyFind(validateObj[defaultLang], validateObj[language], this.findKeys);
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const createdAt = new Date();
        const info = await tx.operationInfo.create({ data: { createdAt, updatedAt: createdAt } });
        await tx.operationInfoTranslation.create({
          data: {
            operationInfoId: info.id,
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
          // 번역언어들 부족한 값 있을경우 번역요청을 위해 updatedAt 1초 감소
          const notFilledList = notMatchKeys[language].filter(item => item.message == 'common.translation_not_filled');
          if (notFilledList && notFilledList.length > 0) translationDate = new Date(translationDate.getTime() - 1000);
          await tx.operationInfoTranslation.create({
            data: {
              operationInfoId: info.id,
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
  async putOperationInfo(id: number, dto: PutOperationInfoReqDto): Promise<string> {
    try {
      const defaultLang = this.settingService.getDefaultLanguage();
      const publicLang = this.settingService.getPublicLanguage();
      const siteUseLanguages = this.settingService.getSiteUseLanguages();
      // 시술 설명2 기본값 체크
      const notDefaultShortDescription = OPERATION_INFO_DESCRIPTION_DEFAULT[defaultLang as Language].filter((key) => !Object.values(dto.shortDescription ?? []).map((item) => item.key).includes(key));
      if (notDefaultShortDescription.length > 0) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: `${defaultLang} 언어의 시술 설명2에 부족한 항목이 있습니다` });
      // 시술정보명 중복 체크
      await this.duplicateTitleCheck(dto.title, defaultLang as Language, id, false);
      // 기준언어 데이터 깊은 복제
      const defaultLanguageData: SetOperationInfoDefaultTranslationDto = (dto) ? JSON.parse(JSON.stringify(dto ?? undefined)) : null;
      // 기존 기준언어 데이터 가져오기
      const allDbOperationInfo = await this.findAllOperationInfoTranslations(id);
      const defaultDbOperationInfo = allDbOperationInfo[defaultLang as Language];
      const otherDbOperationInfo: { [key: string]: any } = {};
      Object.entries(allDbOperationInfo).forEach(([lang, item]) => {
        if (lang !== defaultLang) otherDbOperationInfo[lang] = item;
      });

      let validateObj: { [key: string]: any } = {};
      let notMatchKeys: { key: string, message: string }[] = [];
      let changedKeys: ChangedKey[] = JSON.parse(JSON.stringify(defaultDbOperationInfo.changedKeys)) || [];

      // 기준언어 기존 등록된 데이터 기준 현재 데이터의 부족한 값 찾기 ( 지워졌거나 삭제된 키 찾아서 해당부분은 changedKeys에서 빼기 위해) [파라메터로 전달한 데이터 변환 없는함수]
      notMatchKeys[defaultLang] = notMatchKeyFind(defaultDbOperationInfo, dto, this.findKeys);
      // notMatchKeys[defaultLang] 에서  message 가 common.translation_not_filled 인 key 찾아서 changedKeys 에서 해당 key 삭제 ( common.translation_not_filled 이면 변경된 데이터에서 지워졌다는 의미 )
      let newChangedKeys: ChangedKey[] = changedKeys.filter(key => !notMatchKeys[defaultLang].some(item => item.key === key.key && item.message == 'common.translation_not_filled')) || [];


      // 빈항목 빼기 전 변경된 값 뒤에 changePrefix 붙히기 (추후 위치변환 후 변경 위치 제대로 잡기 위해) [파라메터로 전달한 데이터 변환 있는함수]
      validateObj[defaultLang] = (!dto.isSimpleChange) ? changedKeyFind(defaultDbOperationInfo, defaultLanguageData, this.findKeys) : dto;

      // 변경된 validateObj[defaultLang] 을 넘어온 dto 기반으로 빈 값 및 오버된 값 제거 처리 ( 기준언어 자체 체크라 배열의 빈항목 빼기 로직 + 기존 변경로그가 줄어든 배열이면 줄어든만큼 index도 조정 )
      // [파라메터로 전달한 데이터 변환 있는함수]
      validateObj[defaultLang] = fillTranslationValue(dto, validateObj[defaultLang], this.findKeys, newChangedKeys);

      // validateObj[defaultLang] 의 changePrefix 붙은 항목 찾아서 newChangedKeys에 업데이트 키 추가 후 changePrefix 제거
      // [파라메터로 전달한 데이터 변환 없는함수]
      const { newData, addChangedKeys } = changeWordFind(validateObj[defaultLang]);
      validateObj[defaultLang] = newData;
      if (!dto.isSimpleChange) {
        // newChangedKeys 에 addChangedKeys 에 있는 key는 제거
        newChangedKeys = newChangedKeys.filter(key => !addChangedKeys.some(item => item.key === key.key));
        // newChangedKeys 에 addChangedKeys 에 있는 key 추가
        newChangedKeys.push(...addChangedKeys);
      }
      newChangedKeys = newChangedKeys.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());

      for (const lang of [publicLang, ...siteUseLanguages]) {
        const translationData = otherDbOperationInfo[lang];
        if (!translationData) continue;

        // 기존 언어권 데이터 가져온 후 기준언어 수정 데이터기반 ( 길이변경 이전 데이터 ) 기반으로 채우기 및 제거 처리
        validateObj[lang] = fillTranslationValue(dto, translationData, this.findKeys);
        validateObj[lang].lastChangedAt = translationData.lastChangedAt;

        // 길이 변경된 데이터끼리 기준으로 변역 데이터에서 기준데이터에 없는 값 찾기
        notMatchKeys[lang] = notMatchKeyFind(validateObj[defaultLang], validateObj[lang], this.findKeys);
      }

      const changeKeyLastDate: Date | undefined = newChangedKeys[0] ? new Date(newChangedKeys[0].changedAt) : undefined;

      await this.prisma.$transaction(async (tx) => {
        for (const lang of Object.keys(validateObj)) {
          await tx.operationInfoTranslation.update({
            where: { operationInfoId_language: { operationInfoId: id, language: lang as Language } },
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
        await tx.operationInfo.update({
          where: { id },
          data: {
            changedKeys: newChangedKeys
          },
        });
      });
      return 'update operation info success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }
  // ───────────────────────────────────────────────
  // 공용언어(ko) 번역 수정
  // ───────────────────────────────────────────────
  async putOperationInfoPublicTranslation(id: number, dto: PutOperationInfoPublicTranslationReqDto): Promise<string> {
    try {
      const defaultLang = this.settingService.getDefaultLanguage();
      const publicLang = this.settingService.getPublicLanguage();
      const siteUseLanguages = this.settingService.getSiteUseLanguages();
      if (publicLang as Language === defaultLang) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: '기준 언어는 이 API로 수정할 수 없습니다.' });

      // shortDescription 기본값 체크
      const notDefaultShortDescription = OPERATION_INFO_DESCRIPTION_DEFAULT[publicLang as keyof typeof OPERATION_INFO_DESCRIPTION_DEFAULT]?.filter((key) => !Object.values(dto.shortDescription ?? []).map((item) => item.key).includes(key));
      if (notDefaultShortDescription && notDefaultShortDescription.length > 0) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: `${publicLang} 언어의 시술 설명2에 부족한 항목이 있습니다` });

      // 시술정보명 중복 체크
      if (dto.title) await this.duplicateTitleCheck(dto.title, publicLang as Language, id, false);

      // 기준언어 데이터 + changedKeys 가져오기 / 기존 공용언어 데이터 가져오기 (변경 감지용)
      const allDbOperationInfo = await this.findAllOperationInfoTranslations(id);
      const defaultDbOperationInfo = allDbOperationInfo[defaultLang as Language];
      const publicDbOperationInfo = allDbOperationInfo[publicLang as Language];

      if (!defaultDbOperationInfo) throw new CustomException('common.not_found', 'BAD_REQUEST');

      let publicLanguageData: SetOperationInfoDefaultTranslationDto = (dto) ? JSON.parse(JSON.stringify(dto ?? undefined)) : null;
      let newChangedKeys: ChangedKey[] = JSON.parse(JSON.stringify(defaultDbOperationInfo.changedKeys ?? []));
      let isMatchWhere: { isMatch: boolean } | undefined = undefined;
      if (!dto.isSimpleChange) {
        const publicNotMatchKeys = notMatchKeyFind(defaultDbOperationInfo, publicLanguageData, this.findKeys);
        if (publicNotMatchKeys.length > 0) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: '공용언어 번역 데이터에 부족한 항목이 있습니다', field: publicNotMatchKeys[0].key, fieldMessage: publicNotMatchKeys[0].message });
        const publicChangedData = changedKeyFind(publicDbOperationInfo, publicLanguageData, this.findKeys, true);
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
        await tx.operationInfoTranslation.upsert({
          where: { operationInfoId_language: { operationInfoId: id, language: publicLang as Language } },
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
            operationInfoId: id,
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
          await tx.operationInfoTranslation.updateMany({
            where: { operationInfoId: id, language: { notIn: [publicLang as Language, defaultLang as Language] } },
            data: isMatchWhere,
          });
        }

        const minLastChangedAtResult = await tx.operationInfoTranslation.findMany({
          where: { operationInfoId: id, NOT: { language: defaultLang as Language } },
          orderBy: { lastChangedAt: 'asc' },
          select: { lastChangedAt: true },
        });
        const minLastChangedAt: Date | undefined = minLastChangedAtResult[0] ? new Date(minLastChangedAtResult[0].lastChangedAt) : undefined;
        if (minLastChangedAt) {
          const changedKeys = newChangedKeys.filter(key => new Date(key.changedAt) > minLastChangedAt);
          await tx.operationInfo.update({
            where: { id },
            data: { changedKeys },
          });
        }
      });
      return 'update operation info public translation success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  // ───────────────────────────────────────────────
  // 기타언어 번역 수정
  // ───────────────────────────────────────────────
  async putOperationInfoTranslation(id: number, dto: PutOperationInfoTranslationReqDto): Promise<string> {
    try {
      const defaultLang = this.settingService.getDefaultLanguage();
      const publicLang = this.settingService.getPublicLanguage();
      if (dto.language === defaultLang) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: '기준 언어는 이 API로 수정할 수 없습니다.' });
      if (dto.language === publicLang) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: '공용 언어는 이 API로 수정할 수 없습니다.' });

      // 시술정보명 중복 체크
      if (dto.title) await this.duplicateTitleCheck(dto.title, dto.language, id, false);

      // shortDescription 기본값 체크
      const notDefaultShortDescription = OPERATION_INFO_DESCRIPTION_DEFAULT[dto.language as keyof typeof OPERATION_INFO_DESCRIPTION_DEFAULT]?.filter((key) => !Object.values(dto.shortDescription ?? []).map((item) => item.key).includes(key));
      if (notDefaultShortDescription && notDefaultShortDescription.length > 0) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: `${dto.language} 언어의 시술 설명2에 부족한 항목이 있습니다` });

      // 기준언어 데이터 가져오기
      const allDbOperationInfo = await this.findAllOperationInfoTranslations(id);
      const defaultDbOperationInfo = allDbOperationInfo[defaultLang as Language];
      if (!defaultDbOperationInfo) throw new CustomException('common.not_found', 'NOT_FOUND');

      await this.prisma.$transaction(async (tx) => {
        await tx.operationInfoTranslation.upsert({
          where: { operationInfoId_language: { operationInfoId: id, language: dto.language } },
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
            operationInfoId: id,
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
        const minLastChangedAtResult = await tx.operationInfoTranslation.findMany({
          where: { operationInfoId: id, NOT: { language: defaultLang as Language } },
          orderBy: { lastChangedAt: 'asc' },
          select: { lastChangedAt: true },
        });
        const minLastChangedAt: Date | undefined = minLastChangedAtResult[0] ? new Date(minLastChangedAtResult[0].lastChangedAt) : undefined;
        if (minLastChangedAt) {
          const changedKeys = defaultDbOperationInfo.changedKeys.filter((key: ChangedKey) => new Date(key.changedAt) > minLastChangedAt);
          await tx.operationInfo.update({
            where: { id },
            data: { changedKeys },
          });
        }
      });
      return 'update operation info translation success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  // ───────────────────────────────────────────────
  // 삭제
  // ───────────────────────────────────────────────
  // 상품에 연결돼 있으면 삭제불가 처리
  async deleteOperationInfo(id: number): Promise<string> {
    try {
      const product = await this.prisma.product.findFirst({ where: { operationInfoId: id, deletedAt: null } });
      if (product) throw new CustomException('common.not_deleted_condition', 'NOT_DELETED_CONDITION');
      try {
        await this.prisma.operationInfo.update({ where: { id }, data: { deletedAt: new Date() } });
        return 'delete operation info success';
      } catch (error) {
        throw new CustomException('common.failed_to_delete', 'BAD_REQUEST');
      }
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }
}
