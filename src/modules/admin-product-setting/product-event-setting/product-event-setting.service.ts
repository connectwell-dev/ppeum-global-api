import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { CustomException } from '@common/exceptions';
import { Language } from '@prisma/client';
import { PaginatedResponseDto } from '@common/dto/pagination.dto';
import { SettingService } from '@src/core/setting/setting.service';
import { CommonSetResponseDto } from '@common/dto/common-response.dto';
import { UpdateToggleReqDto } from '@common/dto/common-patch.dto';
import { ChangedKey, changedKeyFind, changeWordFind, notMatchKeyFind } from '@common/utils/changed-key-find';
import { ERROR_MESSAGE } from '@common/constants/error-message';
import { GetProductEventListReqDto } from './dto/get-product-event/query.dto';
import { GetProductEventDetailResDto, GetProductEventListResDto, GetProductEventTranslationResDto } from './dto/get-product-event/response.dto';
import { SetProductEventReqDto } from './dto/set-product-event/request.dto';
import { PutProductEventReqDto, PutProductEventPublicTranslationReqDto, PutProductEventTranslationReqDto } from './dto/put-product-event/request.dto';
import { PatchProductEventOrderReqDto } from './dto/patch-product-event/request.dto';
import { SetEventProductsReqDto } from './dto/set-product-event-products/request.dto';
import { PutEventProductReqDto } from './dto/put-product-event-products/request.dto';
import { DeleteEventProductsReqDto } from './dto/delete-product-event-products/request.dto';
import { OrderHelper } from '@src/core/helpers/order.helper';
import { pickTranslation } from '@common/utils/translation-utils';
@Injectable()
export class ProductEventSettingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingService: SettingService,
    private readonly orderHelper: OrderHelper,
  ) { }

  findKeys = [
    { key: 'name', defaultValue: '' },
    { key: 'imageCode', defaultValue: '' }
  ]
  private getAllLanguages(): Language[] {
    return [
      this.settingService.getDefaultLanguage(),
      this.settingService.getPublicLanguage(),
      ...this.settingService.getSiteUseLanguages(),
    ] as Language[];
  }

  async duplicateNameCheck(name: string, language: Language, eventId?: number, isSet: boolean = true): Promise<void> {
    const duplicateEvent = await this.prisma.productEventTranslation.findFirst({
      where: { name, language, productEvent: { deletedAt: null }, ...(eventId ? { productEventId: { not: eventId } } : {}) },
    });
    if (duplicateEvent) throw new CustomException('product.event.name.duplicate', 'BAD_REQUEST', { field: `${isSet ? language + '.' : ''}name`, fieldMessage: 'product.event.name.duplicate' });
  }

  // ────────── 이벤트 목록 ──────────

  async getProductEventList(dto: GetProductEventListReqDto, headerLang: Language): Promise<PaginatedResponseDto<GetProductEventListResDto>> {
    try {
      const { eventType, isActive, name, notInputLanguage } = dto;
      const page = dto.page ?? 1;
      const rowCount = dto.rowCount ?? 10;
      const sort = dto.sort ?? 'createdAt';
      const order = dto.order ?? 'desc';

      if (notInputLanguage === (this.settingService.getDefaultLanguage() as Language)) {
        return { total: 0, page: 1, totalPage: 1, data: [] };
      }

      const notInputFilter = notInputLanguage
        ? {
          OR: [
            { NOT: { productEventTranslations: { some: { language: notInputLanguage } } } },
            { productEventTranslations: { some: { language: notInputLanguage, isMatch: false } } },
          ],
        }
        : {};

      const where: any = {
        ...(eventType && { eventType }),
        ...(isActive !== undefined && { isActive }),
        ...notInputFilter,
        deletedAt: null,
      };

      const nameFilter = name
        ? { productEventTranslations: { some: { name: { contains: name } } } }
        : {};

      const [total, list] = await Promise.all([
        this.prisma.productEvent.count({ where: { ...where, ...nameFilter } }),
        this.prisma.productEvent.findMany({
          where: { ...where, ...nameFilter },
          include: {
            productEventTranslations: {
              select: { language: true, name: true, isMatch: true },
            },
          },
          orderBy: { [sort]: order },
          skip: (page - 1) * rowCount,
          take: rowCount,
        }),
      ]);

      const totalPage = Math.ceil(total / rowCount) || 1;

      const data: GetProductEventListResDto[] = list.map((event) => {
        const defaultLang = this.settingService.getDefaultLanguage() as Language;

        const notInputLanguages = this.getAllLanguages().filter((lang) => {
          if (lang === (this.settingService.getDefaultLanguage() as Language)) return false;
          const t = event.productEventTranslations.find((t) => t.language === lang);
          return !t || !t.isMatch;
        });

        return {
          id: event.id,
          code: event.code,
          order: event.order,
          name: pickTranslation(event.productEventTranslations ?? [], 'name', headerLang, defaultLang),
          isActive: event.isActive,
          eventType: event.eventType,
          startDate: event.startDate,
          endDate: event.endDate,
          reservationStartDate: event.reservationStartDate,
          reservationEndDate: event.reservationEndDate,
          weekDay: event.weekDay,
          notInputLanguages,
          createdAt: event.createdAt,
        } as any;
      });

      return { total, page, totalPage, data };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  // ────────── 이벤트 상세 ──────────

  async getProductEventDetail(id: number): Promise<GetProductEventDetailResDto> {
    try {
      const event = await this.prisma.productEvent.findUnique({
        where: { id, deletedAt: null },
        include: {
          productEventTranslations: {
            select: { language: true, name: true, imageCode: true, image: { select: { code: true, name: true, path: true } }, isMatch: true, lastChangedAt: true },
          },
        },
      });

      if (!event) {
        throw new CustomException('common.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'common.not_found' });
      }
      const defaultLang = this.settingService.getDefaultLanguage() as Language;
      const defaultTranslation = event.productEventTranslations.find((t) => t.language === defaultLang);

      return {
        id: event.id,
        code: event.code,
        name: defaultTranslation?.name ?? '',
        image: defaultTranslation?.image ?? null,
        isActive: event.isActive,
        eventType: event.eventType,
        startDate: event.startDate,
        endDate: event.endDate,
        reservationStartDate: event.reservationStartDate,
        reservationEndDate: event.reservationEndDate,
        weekDay: event.weekDay,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      } as any;
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  // ────────── 이벤트 번역 상세 ──────────

  async getProductEventTranslation(id: number, language: Language, headerLang: Language): Promise<GetProductEventTranslationResDto> {
    const defaultLang = this.settingService.getDefaultLanguage() as Language;
    const publicLang = this.settingService.getPublicLanguage() as Language;
    try {
      const event = await this.prisma.productEvent.findUnique({
        where: { id, deletedAt: null },
        select: {
          changedKeys: true,
          productEventTranslations: {
            select: { language: true, name: true, imageCode: true, isMatch: true, lastChangedAt: true, image: { select: { code: true, name: true, path: true } } },
          },
        },
      });
      if (!event) throw new CustomException('common.not_found', 'BAD_REQUEST');

      const targetTranslation = event.productEventTranslations.find((t) => t.language === language) ?? null;

      let originName = null;
      let originImage = null;
      let originImageCode = null;
      if (language === publicLang) {
        originName = pickTranslation(event.productEventTranslations ?? [], 'name', defaultLang, defaultLang);
        originImage = pickTranslation(event.productEventTranslations ?? [], 'image', defaultLang, defaultLang);
        originImageCode = pickTranslation(event.productEventTranslations ?? [], 'imageCode', defaultLang, defaultLang);
      } else {
        originName = pickTranslation(event.productEventTranslations ?? [], 'name', publicLang, defaultLang);
        originImage = pickTranslation(event.productEventTranslations ?? [], 'image', publicLang, defaultLang);
        originImageCode = pickTranslation(event.productEventTranslations ?? [], 'imageCode', publicLang, defaultLang);
      }

      let notMatchKeys = notMatchKeyFind(
        { name: originName ?? '', imageCode: originImageCode ?? '' },
        { name: targetTranslation?.name ?? '', imageCode: targetTranslation?.imageCode ?? '' },
        this.findKeys,
      );
      notMatchKeys = notMatchKeys.map((item) => ({ ...item, message: ERROR_MESSAGE[item.message]?.[headerLang] }));

      if (targetTranslation?.lastChangedAt) {
        const changedKeys = (event.changedKeys as ChangedKey[]).filter((k) => new Date(k.changedAt) > new Date(targetTranslation.lastChangedAt!));
        for (const item of changedKeys) {
          if (!notMatchKeys.find((k) => k.key === item.key))
            notMatchKeys.push({ key: item.key, message: ERROR_MESSAGE['common.translation_not_updated']?.[headerLang] });
        }
      }

      return {
        name: targetTranslation?.name ?? '',
        image: targetTranslation?.image ?? null,
        originName: originName ?? '',
        originImage: originImage ?? null,
        notMatchKeys,
      };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  // ────────── 이벤트 등록 ──────────

  async setProductEvent(dto: SetProductEventReqDto): Promise<CommonSetResponseDto> {
    try {
      const defaultLang = this.settingService.getDefaultLanguage() as Language;

      for (const t of dto.eventTranslations) {
        if (t.name) await this.duplicateNameCheck(t.name, t.language);
      }
      const defaultData = dto.eventTranslations?.find((t) => t.language === defaultLang);
      if (!defaultData?.name) throw new CustomException('product.event.name.required', 'BAD_REQUEST', { field: `name.${defaultLang}`, fieldMessage: 'product.event.name.required' });
      const event = await this.prisma.$transaction(async (tx) => {
        const nextOrder = await this.orderHelper.getNextOrder('productEvent', { deletedAt: null }, tx);
        const created = await tx.productEvent.create({
          data: {
            eventType: dto.eventType,
            startDate: dto.startDate ?? null,
            endDate: dto.endDate ?? null,
            reservationStartDate: dto.reservationStartDate ?? null,
            reservationEndDate: dto.reservationEndDate ?? null,
            weekDay: dto.weekDay ?? [],
            isActive: dto.isActive,
            order: nextOrder,
            changedKeys: [],
          },
        });

        for (const transData of dto.eventTranslations) {
          if (transData) {
            let notMatchKeys = notMatchKeyFind(
              defaultData,
              transData,
              this.findKeys,
            );
            await tx.productEventTranslation.create({
              data: {
                productEventId: created.id,
                language: transData.language,
                name: transData.name || null,
                imageCode: transData.imageCode || null,
                isMatch: (notMatchKeys.length === 0),
                lastChangedAt: new Date(),
              },
            });
          }

        }

        return created;
      });

      return { id: event.id };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  // ────────── 이벤트 수정 (기준언어) ──────────

  async putProductEvent(id: number, dto: PutProductEventReqDto): Promise<string> {
    try {
      const defaultLang = this.settingService.getDefaultLanguage() as Language;
      await this.duplicateNameCheck(dto.name, defaultLang, id, false);

      const allDbEvent = await this.findAllEventDetailWithTranslation(id);
      const dbEvent = allDbEvent[defaultLang];
      if (!dbEvent) throw new CustomException('common.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'common.not_found' });

      const originName = dbEvent.name ?? '';
      const originImageCode = dbEvent.imageCode ?? '';

      let addChangedKeys: ChangedKey[] = [];
      if (!dto.isSimpleChange) {
        const translationDto = { name: dto.name, imageCode: dto.imageCode ?? '' };
        changedKeyFind(dbEvent, translationDto, this.findKeys);
        addChangedKeys = changeWordFind(translationDto).addChangedKeys;
      }

      for (const item of addChangedKeys) {
        if (!dbEvent.changedKeys.some((k: ChangedKey) => k.key === item.key)) dbEvent.changedKeys.push(item);
        else (dbEvent.changedKeys.find((k: ChangedKey) => k.key === item.key) as ChangedKey).changedAt = item.changedAt;
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.productEvent.update({
          where: { id },
          data: {
            eventType: dto.eventType,
            startDate: dto.startDate ?? null,
            endDate: dto.endDate ?? null,
            reservationStartDate: dto.reservationStartDate ?? null,
            reservationEndDate: dto.reservationEndDate ?? null,
            weekDay: dto.weekDay ?? [],
            isActive: dto.isActive,
            changedKeys: dbEvent.changedKeys || [],
          },
        });

        if (addChangedKeys.length > 0) {
          await tx.productEventTranslation.updateMany({
            where: { productEventId: id, language: { notIn: [defaultLang] } },
            data: { isMatch: false },
          });
        }

        const nameChanged = dto.name !== originName;
        const imageCodeChanged = (dto.imageCode || '') !== originImageCode;
        const translationUpdate: any = (nameChanged || imageCodeChanged) ? {
          ...(nameChanged ? { name: dto.name } : {}),
          ...(imageCodeChanged ? { imageCode: dto.imageCode || null } : {}),
          isMatch: true,
          lastChangedAt: new Date(),
        } : {};


        await tx.productEventTranslation.upsert({
          where: { productEventId_language: { productEventId: id, language: defaultLang } },
          update: translationUpdate,
          create: { productEventId: id, language: defaultLang, name: dto.name, imageCode: dto.imageCode || null, isMatch: true, lastChangedAt: new Date() },
        });

        const ohterUpdate: any = {}
        if (!dto.name) ohterUpdate.name = null
        if (!dto.imageCode) ohterUpdate.imageCode = null
        await tx.productEventTranslation.updateMany({
          where: { productEventId: id, language: { notIn: [defaultLang] } },
          data: ohterUpdate,
        });

        const minLastChangedAt = await tx.productEventTranslation.findFirst({
          where: { productEventId: id, NOT: { language: defaultLang } },
          orderBy: { lastChangedAt: 'asc' },
          select: { language: true, lastChangedAt: true },
        });
        const newChangedKeys = dbEvent.changedKeys.filter((k: ChangedKey) => new Date(k.changedAt) > new Date(minLastChangedAt?.lastChangedAt ?? 0));
        await tx.productEvent.update({ where: { id }, data: { changedKeys: newChangedKeys } });
      });

      return 'update product event success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }


  private async findAllEventDetailWithTranslation(id: number): Promise<any> {
    try {
      const event = await this.prisma.productEvent.findUnique({
        where: { id, deletedAt: null },
        include: {
          productEventTranslations: { select: { language: true, name: true, imageCode: true, image: { select: { code: true, name: true, path: true } }, isMatch: true, lastChangedAt: true } },
        },
      });
      if (!event) return {};
      const result: { [lang: string]: any } = {};
      for (const translation of event.productEventTranslations) {
        const { image, language, ...translationData } = translation as any;
        result[language] = { ...event, ...translationData, image: image, };
      }
      return result;
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }



  private getEventRestChangedFields(dbTranslationEvent: any, language: Language): ChangedKey[] {
    const translations = [...this.settingService.getSiteUseLanguages(), this.settingService.getPublicLanguage()]
      .filter((lang) => lang !== language)
      .map((lang) => dbTranslationEvent.productEventTranslations.find((t: any) => t.language === lang));
    const existingTranslations = translations.filter((t) => t != null);
    const minLastChangedAt = existingTranslations.some((t) => !t.name)
      ? null
      : existingTranslations.length > 0
        ? existingTranslations.map((t) => t.lastChangedAt).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]
        : null;
    return (dbTranslationEvent.changedKeys as ChangedKey[]).filter(
      (item) => new Date(item.changedAt) > new Date(minLastChangedAt ?? 0),
    );
  }

  private async findEventTranslationChangedFields(dbTranslationEvent: any, dto: { name: string; imageCode?: string }): Promise<void> {
    if (dbTranslationEvent.lastChangedAt) {
      const changeCheckFields = (dbTranslationEvent.changedKeys as ChangedKey[]).filter(
        (key) => new Date(key.changedAt) > new Date(dbTranslationEvent.lastChangedAt),
      );
      if (changeCheckFields.length > 0) {
        for (const item of changeCheckFields) {
          if ((dto as any)[item.key] == (dbTranslationEvent[item.key] ?? '')) {
            throw new CustomException('product.event.translation.name.notChanged', 'BAD_REQUEST', {
              field: item.key,
              fieldMessage: `product.event.translation.${item.key}.notChanged`,
            });
          }
        }
      }
    }
  }

  // ────────── 이벤트 수정 (공용언어) ──────────

  async putProductEventPublicTranslation(id: number, dto: PutProductEventPublicTranslationReqDto): Promise<string> {
    const { language, name, isSimpleChange = true } = dto;
    const defaultLang = this.settingService.getDefaultLanguage() as Language;
    const publicLang = this.settingService.getPublicLanguage() as Language;
    if (language === defaultLang && defaultLang !== publicLang) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: '기준 언어는 해당 엔드포인트로 수정 불가능합니다.' });
    if (this.settingService.getSiteUseLanguages().includes(language as Language)) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: '기타 언어는 해당 엔드포인트로 수정 불가능합니다.' });
    try {
      await this.duplicateNameCheck(name, language as Language, id, false);
      const allDbEvent = await this.findAllEventDetailWithTranslation(id);
      const defaultDbEvent = allDbEvent[defaultLang];
      if (!defaultDbEvent) throw new CustomException('common.not_found', 'BAD_REQUEST');
      const publicDbEvent = allDbEvent[publicLang];

      let addChangedKeys: ChangedKey[] = [];
      if (!isSimpleChange) {
        await this.findEventTranslationChangedFields(publicDbEvent, dto);
        const copyDto = JSON.parse(JSON.stringify({ name, imageCode: dto.imageCode ?? '' }));
        changedKeyFind(publicDbEvent, copyDto, this.findKeys);
        addChangedKeys = changeWordFind(copyDto).addChangedKeys;
      }

      // 기준언어에 있는데 변경 데이터에 없으면 에러
      const notMatchKeys = notMatchKeyFind(defaultDbEvent, dto, this.findKeys);
      if (notMatchKeys.length > 0) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: '공용언어 번역 데이터에 부족한 항목이 있습니다', field: notMatchKeys[0].key, fieldMessage: notMatchKeys[0].message });

      let restChangedFields: ChangedKey[] = [];
      if (publicDbEvent) {
        restChangedFields = this.getEventRestChangedFields(publicDbEvent, publicLang as Language);
      }

      for (const newKey of addChangedKeys) {
        const index = restChangedFields.findIndex((t) => t.key === newKey.key);
        if (index !== -1) restChangedFields[index].changedAt = newKey.changedAt;
        else restChangedFields.push(newKey);
      }

      await this.prisma.$transaction(async (tx) => {

        if (addChangedKeys.length > 0) {
          await tx.productEventTranslation.updateMany({
            where: { productEventId: id, language: { notIn: [defaultLang] } },
            data: { isMatch: false },
          });
        }
        if (publicDbEvent) {
          await tx.productEvent.update({ where: { id }, data: { changedKeys: restChangedFields } });
        }
        await tx.productEventTranslation.upsert({
          where: { productEventId_language: { productEventId: id, language: publicLang } },
          update: { name, imageCode: dto.imageCode || null, isMatch: true, lastChangedAt: new Date() },
          create: { productEventId: id, language: publicLang, name, imageCode: dto.imageCode || null, isMatch: true, lastChangedAt: new Date() },
        });
      });
      return 'update product event translation success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  // ────────── 이벤트 수정 (기타언어) ──────────

  async putProductEventTranslation(id: number, dto: PutProductEventTranslationReqDto): Promise<string> {
    const { language, name } = dto;
    if (language === (this.settingService.getDefaultLanguage() as Language) || language === (this.settingService.getPublicLanguage() as Language)) {
      throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: '기준언어 및 공용언어는 해당 엔드포인트로 수정 불가능합니다.' });
    }
    try {
      const defaultLang = this.settingService.getDefaultLanguage() as Language;
      await this.duplicateNameCheck(name, language as Language, id, false);
      const allDbEvent = await this.findAllEventDetailWithTranslation(id);
      const defaultDbEvent = allDbEvent[defaultLang as Language];
      if (!defaultDbEvent) throw new CustomException('common.not_found', 'BAD_REQUEST');
      const translationDbEvent = allDbEvent[language as Language];


      const sourceDbEvent = translationDbEvent ?? defaultDbEvent;
      const restChangedFields = this.getEventRestChangedFields(sourceDbEvent, language as Language);

      const notMatchKeys = notMatchKeyFind(defaultDbEvent, dto, this.findKeys);
      if (notMatchKeys.length > 0) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: '번역 데이터에 부족한 항목이 있습니다', field: notMatchKeys[0].key, fieldMessage: notMatchKeys[0].message });


      await this.prisma.$transaction(async (tx) => {
        await tx.productEventTranslation.upsert({
          where: { productEventId_language: { productEventId: id, language: language as Language } },
          update: { name, imageCode: dto.imageCode || null, isMatch: true, lastChangedAt: new Date() },
          create: { productEventId: id, language: language as Language, name, imageCode: dto.imageCode || null, isMatch: true, lastChangedAt: new Date() },
        });
        await tx.productEvent.update({ where: { id }, data: { changedKeys: restChangedFields } });
      });
      return 'update product event translation success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  // ────────── 이벤트 삭제 ──────────

  async deleteProductEvent(id: number): Promise<string> {
    try {
      const event = await this.prisma.productEvent.findUnique({
        where: { id },
        include: { productToProductEvents: true },
      });
      if (!event) throw new CustomException('product.event.not_found', 'BAD_REQUEST');
      if (event.productToProductEvents.length > 0) throw new CustomException('common.not_deleted_condition', 'NOT_DELETED_CONDITION');

      await this.prisma.$transaction(async (tx) => {
        await tx.productEvent.delete({ where: { id } });
        await this.orderHelper.reorderAfterDelete('productEvent', event.order, { deletedAt: null }, tx);
      });
      return 'delete product event success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  // ────────── 사용 여부 토글 ──────────

  async patchProductEventToggle(id: number, dto: UpdateToggleReqDto): Promise<string> {
    try {
      const event = await this.prisma.productEvent.findUnique({ where: { id } });
      if (!event) {
        throw new CustomException('common.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'common.not_found' });
      }

      await this.prisma.productEvent.update({ where: { id }, data: { isActive: dto.isActive } });
      return 'update product event toggle success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  // ────────── 순서 변경 ──────────

  async patchProductEventOrder(dto: PatchProductEventOrderReqDto): Promise<string> {
    try {
      await this.prisma.$transaction(async (tx) => {
        for (const item of dto.items) {
          await tx.productEvent.update({ where: { id: item.id }, data: { order: item.order } });
        }
      });
      return 'update product event order success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  // ────────── 이벤트 상품 ──────────

  async getEventProductList(eventId: number, headerLang: Language): Promise<any[]> {
    try {
      const defaultLang = this.settingService.getDefaultLanguage() as Language;
      const event = await this.prisma.productEvent.findUnique({ where: { id: eventId } });
      if (!event) throw new CustomException('common.not_found', 'BAD_REQUEST', { field: 'eventId', fieldMessage: 'common.not_found' });

      const links = await this.prisma.productToProductEvent.findMany({
        where: { productEventId: eventId },
        include: {
          product: {
            include: {
              productTranslations: {
                where: { language: { in: [headerLang, defaultLang] } },
                select: { language: true, name: true },
              },
              productCategory: {
                include: {
                  productCategoryTranslations: {
                    where: { language: { in: [headerLang, defaultLang] } },
                    select: { language: true, name: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { order: 'asc' },
      });

      return links.map((link) => {
        const name = pickTranslation(link.product?.productTranslations ?? [], 'name', headerLang, defaultLang)
        const categoryName = pickTranslation(link.product?.productCategory?.productCategoryTranslations ?? [], 'name', headerLang, defaultLang)
        const price = link.product?.productPrice ?? 0;

        return {
          productId: link.productId,
          eventPrice: link.eventPrice,
          eventDiscountPercent: link.eventDiscountPercent,
          order: link.order,
          name,
          categoryName,
          productPrice: price,
        };
      });
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async setEventProducts(eventId: number, dto: SetEventProductsReqDto): Promise<string> {
    try {
      const event = await this.prisma.productEvent.findUnique({ where: { id: eventId } });
      if (!event) {
        throw new CustomException('product.event.not_found', 'BAD_REQUEST', { field: 'eventId', fieldMessage: 'product.event.not_found' });
      }

      // 상품 존재 여부 확인
      const productIds = dto.products.map((p) => p.productId);
      const products = await this.prisma.product.findMany({
        where: { id: { in: productIds }, deletedAt: null },
        select: { id: true },
      });

      if (products.length !== productIds.length) {
        throw new CustomException('product.not_found', 'BAD_REQUEST', { field: 'productId', fieldMessage: 'product.not_found' });
      }

      // 이미 연결된 상품 중복 확인
      const existing = await this.prisma.productToProductEvent.findMany({
        where: { productEventId: eventId, productId: { in: productIds } },
        select: { productId: true },
      });

      if (existing.length > 0) {
        throw new CustomException('product.event.product.duplicate', 'BAD_REQUEST');
      }

      const baseOrder = await this.orderHelper.getNextOrder('productToProductEvent', { productEventId: eventId });

      await this.prisma.$transaction(async (tx) => {
        for (const [index, p] of dto.products.entries()) {
          await tx.productToProductEvent.create({
            data: {
              productId: p.productId,
              productEventId: eventId,
              eventPrice: p.eventPrice,
              eventDiscountPercent: 0,
              order: baseOrder + index,
              isActive: true
            },
          });
        }
      });

      return 'set event products success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async putEventProduct(eventId: number, dto: PutEventProductReqDto): Promise<string> {
    try {
      const event = await this.prisma.productEvent.findUnique({ where: { id: eventId } });
      if (!event) {
        throw new CustomException('product.event.not_found', 'BAD_REQUEST');
      }

      const originProducts = await this.prisma.productToProductEvent.findMany({
        where: { productEventId: eventId },
        select: { productId: true, eventPrice: true, eventDiscountPercent: true, order: true },
      });

      const linkedProductIds = originProducts.map((op) => op.productId);
      const notLinked = dto.products.filter((p) => !linkedProductIds.includes(p.productId));
      if (notLinked.length > 0) throw new CustomException('product.event.product.not_found', 'BAD_REQUEST');

      await this.prisma.$transaction(async (tx) => {
        for (const p of dto.products) {
          await tx.productToProductEvent.update({
            where: { productId_productEventId: { productId: p.productId, productEventId: eventId } },
            data: { eventPrice: p.eventPrice, eventDiscountPercent: p.eventDiscountPercent, order: p.order }
          });
        }
      });

      return 'update event product success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async deleteEventProduct(eventId: number, dto: DeleteEventProductsReqDto): Promise<string> {
    try {
      const links = await this.prisma.productToProductEvent.findMany({
        where: { productEventId: eventId, productId: { in: dto.productIds } },
        select: { productId: true, order: true },
        orderBy: { order: 'asc' },
      });

      if (links.length !== dto.productIds.length) {
        throw new CustomException('product.event.product.not_found', 'BAD_REQUEST');
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.productToProductEvent.deleteMany({
          where: { productEventId: eventId, productId: { in: dto.productIds } },
        });

        // 남은 항목들을 order 순으로 조회 후 1부터 순차 재부여
        const remaining = await tx.productToProductEvent.findMany({
          where: { productEventId: eventId },
          orderBy: { order: 'asc' },
          select: { productId: true },
        });

        for (const [index, item] of remaining.entries()) {
          await tx.productToProductEvent.update({
            where: { productId_productEventId: { productId: item.productId, productEventId: eventId } },
            data: { order: index + 1 },
          });
        }
      });

      return 'delete event product success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }
}
