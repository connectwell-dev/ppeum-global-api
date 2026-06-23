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
import { GetProductCategoryListReqDto } from './dto/get-product-category/query.dto';
import { GetProductCategoryDetailResDto, GetProductCategoryListResDto, GetProductCategoryTranslationResDto } from './dto/get-product-category/response.dto';
import { SetProductCategoryReqDto } from './dto/set-product-category/request.dto';
import { PutProductCategoryReqDto, PutProductCategoryPublicTranslationReqDto, PutProductCategoryTranslationReqDto } from './dto/put-product-category/request.dto';
import { PatchProductCategoryOrderReqDto } from './dto/patch-product-category/request.dto';
import { OrderHelper } from '@src/core/helpers/order.helper';
import { pickTranslation } from '@common/utils/translation-utils';
@Injectable()
export class ProductCategorySettingService {
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

  async duplicateNameCheck(name: string, language: Language, categoryId?: number, isSet: boolean = true): Promise<void> {
    const duplicateCategory = await this.prisma.productCategoryTranslation.findFirst({
      where: { name, language, productCategory: { deletedAt: null }, ...(categoryId ? { productCategoryId: { not: categoryId } } : {}) },
    });
    if (duplicateCategory) throw new CustomException('product.category.name.duplicate', 'BAD_REQUEST', { field: `${isSet ? language + '.' : ''}name`, fieldMessage: 'product.category.name.duplicate' });
  }

  // ────────── 카테고리 목록 ──────────

  async getProductCategoryList(dto: GetProductCategoryListReqDto, headerLang: Language): Promise<PaginatedResponseDto<GetProductCategoryListResDto>> {
    try {
      const { categoryType, isActive, name, notInputLanguage } = dto;
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
            { NOT: { productCategoryTranslations: { some: { language: notInputLanguage } } } },
            { productCategoryTranslations: { some: { language: notInputLanguage, isMatch: false } } },
          ],
        }
        : {};

      const where: any = {
        ...(categoryType && { categoryType }),
        ...(isActive !== undefined && { isActive }),
        ...notInputFilter,
        deletedAt: null,
      };

      const nameFilter = name
        ? { productCategoryTranslations: { some: { name: { contains: name } } } }
        : {};

      const [total, list] = await Promise.all([
        this.prisma.productCategory.count({ where: { ...where, ...nameFilter } }),
        this.prisma.productCategory.findMany({
          where: { ...where, ...nameFilter },
          include: {
            productCategoryTranslations: {
              select: { language: true, name: true, isMatch: true },
            },
          },
          orderBy: { [sort]: order },
          skip: (page - 1) * rowCount,
          take: rowCount,
        }),
      ]);

      const totalPage = Math.ceil(total / rowCount) || 1;

      const data: GetProductCategoryListResDto[] = list.map((category) => {
        const defaultLang = this.settingService.getDefaultLanguage() as Language;

        const notInputLanguages = this.getAllLanguages().filter((lang) => {
          if (lang === (this.settingService.getDefaultLanguage() as Language)) return false;
          const t = category.productCategoryTranslations.find((t) => t.language === lang);
          return !t || !t.isMatch;
        });

        return {
          id: category.id,
          code: category.code,
          order: category.order,
          name: pickTranslation(category.productCategoryTranslations ?? [], 'name', headerLang, defaultLang),
          isActive: category.isActive,
          categoryType: category.categoryType,
          startDate: category.startDate,
          endDate: category.endDate,
          reservationStartDate: category.reservationStartDate,
          reservationEndDate: category.reservationEndDate,
          weekDay: category.weekDay,
          notInputLanguages,
          createdAt: category.createdAt,
        } as any;
      });

      return { total, page, totalPage, data };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  // ────────── 카테고리 상세 ──────────

  async getProductCategoryDetail(id: number, headerLang: Language): Promise<GetProductCategoryDetailResDto> {
    try {
      const defaultLang = this.settingService.getDefaultLanguage() as Language;

      const category = await this.prisma.productCategory.findUnique({
        where: { id, deletedAt: null },
        include: {
          productCategoryTranslations: {
            select: { language: true, name: true, imageCode: true, image: { select: { code: true, name: true, path: true } }, isMatch: true, lastChangedAt: true },
          },
          productToProductCategories: {
            include: {
              product: {
                include: {
                  productTranslations: {
                    where: { language: { in: [headerLang, defaultLang] } },
                    select: { language: true, name: true, isView: true },
                  },
                },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!category) {
        throw new CustomException('common.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'common.not_found' });
      }
      const defaultTranslation = category.productCategoryTranslations.find((t) => t.language === defaultLang);

      const products = category.productToProductCategories.map((link) => {
        const headerTranslation = link.product?.productTranslations?.find((t) => t.language === headerLang && t.isView);
        const defaultProductTranslation = link.product?.productTranslations?.find((t) => t.language === defaultLang);
        const name = headerTranslation?.name ?? defaultProductTranslation?.name ?? '';

        return {
          productId: link.productId,
          name,
          productPrice: link.product?.productPrice ?? 0,
          eventPrice: link.product?.eventPrice ?? null,
          promotionPrice: link.promotionPrice,
          eventDiscountPercent: link.eventDiscountPercent,
          order: link.order,
        };
      });

      return {
        id: category.id,
        code: category.code,
        name: defaultTranslation?.name ?? '',
        image: defaultTranslation?.image ?? null,
        isActive: category.isActive,
        categoryType: category.categoryType,
        startDate: category.startDate,
        endDate: category.endDate,
        reservationStartDate: category.reservationStartDate,
        reservationEndDate: category.reservationEndDate,
        weekDay: category.weekDay,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        products,
      } as any;
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  // ────────── 카테고리 번역 상세 ──────────

  async getProductCategoryTranslation(id: number, language: Language, headerLang: Language): Promise<GetProductCategoryTranslationResDto> {
    const defaultLang = this.settingService.getDefaultLanguage() as Language;
    const publicLang = this.settingService.getPublicLanguage() as Language;
    try {
      const category = await this.prisma.productCategory.findUnique({
        where: { id, deletedAt: null },
        select: {
          changedKeys: true,
          productCategoryTranslations: {
            select: { language: true, name: true, imageCode: true, isView: true, isMatch: true, lastChangedAt: true, image: { select: { code: true, name: true, path: true } } },
          },
          productToProductCategories: {
            include: {
              product: {
                include: {
                  productTranslations: {
                    where: { language: { in: [language, defaultLang] } },
                    select: { language: true, name: true, isView: true },
                  },
                },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      });
      if (!category) throw new CustomException('common.not_found', 'BAD_REQUEST');

      const targetTranslation = category.productCategoryTranslations.find((t) => t.language === language) ?? null;

      let originName = null;
      let originImage = null;
      let originImageCode = null;
      if (language === publicLang) {
        originName = pickTranslation(category.productCategoryTranslations ?? [], 'name', defaultLang, defaultLang);
        originImage = pickTranslation(category.productCategoryTranslations ?? [], 'image', defaultLang, defaultLang);
        originImageCode = pickTranslation(category.productCategoryTranslations ?? [], 'imageCode', defaultLang, defaultLang);
      } else {
        originName = pickTranslation(category.productCategoryTranslations ?? [], 'name', publicLang, defaultLang);
        originImage = pickTranslation(category.productCategoryTranslations ?? [], 'image', publicLang, defaultLang);
        originImageCode = pickTranslation(category.productCategoryTranslations ?? [], 'imageCode', publicLang, defaultLang);
      }

      let notMatchKeys = notMatchKeyFind(
        { name: originName ?? '', imageCode: originImageCode ?? '' },
        { name: targetTranslation?.name ?? '', imageCode: targetTranslation?.imageCode ?? '' },
        this.findKeys,
      );
      notMatchKeys = notMatchKeys.map((item) => ({ ...item, message: ERROR_MESSAGE[item.message]?.[headerLang] }));

      if (targetTranslation?.lastChangedAt) {
        const changedKeys = (category.changedKeys as ChangedKey[]).filter((k) => new Date(k.changedAt) > new Date(targetTranslation.lastChangedAt!));
        for (const item of changedKeys) {
          if (!notMatchKeys.find((k) => k.key === item.key))
            notMatchKeys.push({ key: item.key, message: ERROR_MESSAGE['common.translation_not_updated']?.[headerLang] });
        }
      }

      const products = category.productToProductCategories
        .filter((link) => {
          const langTranslation = link.product?.productTranslations?.find((t) => t.language === language);
          return langTranslation ? langTranslation.isView : true;
        })
        .map((link) => {
          const langTranslation = link.product?.productTranslations?.find((t) => t.language === language && t.isView);
          const defaultProductTranslation = link.product?.productTranslations?.find((t) => t.language === defaultLang);
          const name = langTranslation?.name ?? defaultProductTranslation?.name ?? '';

          return {
            productId: link.productId,
            name,
            productPrice: link.product?.productPrice ?? 0,
            eventPrice: link.product?.eventPrice ?? null,
            promotionPrice: link.promotionPrice,
            eventDiscountPercent: link.eventDiscountPercent,
            order: link.order,
          };
        });

      return {
        name: targetTranslation?.name ?? '',
        image: targetTranslation?.image ?? null,
        isView: targetTranslation?.isView ?? true,
        originName: originName ?? '',
        originImage: originImage ?? null,
        notMatchKeys,
        products,
      };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  // ────────── 카테고리 등록 ──────────

  async setProductCategory(dto: SetProductCategoryReqDto): Promise<CommonSetResponseDto> {
    try {
      const defaultLang = this.settingService.getDefaultLanguage() as Language;

      for (const t of dto.categoryTranslations) {
        if (t.name) await this.duplicateNameCheck(t.name, t.language);
      }
      const defaultData = dto.categoryTranslations?.find((t) => t.language === defaultLang);
      if (!defaultData?.name) throw new CustomException('product.category.name.required', 'BAD_REQUEST', { field: `name.${defaultLang}`, fieldMessage: 'product.category.name.required' });
      const category = await this.prisma.$transaction(async (tx) => {
        const nextOrder = await this.orderHelper.getNextOrder('productCategory', { deletedAt: null, categoryType: dto.categoryType }, tx);
        const created = await tx.productCategory.create({
          data: {
            categoryType: dto.categoryType,
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

        for (const transData of dto.categoryTranslations) {
          if (transData) {
            let notMatchKeys = notMatchKeyFind(
              defaultData,
              transData,
              this.findKeys,
            );
            await tx.productCategoryTranslation.create({
              data: {
                productCategoryId: created.id,
                language: transData.language,
                name: transData.name || null,
                imageCode: transData.imageCode || null,
                isView: transData.isView ?? true,
                isMatch: (notMatchKeys.length === 0),
                lastChangedAt: new Date(),
              },
            });
          }
        }

        if (dto.products && dto.products.length > 0) {
          for (const [index, p] of dto.products.entries()) {
            await tx.productToProductCategory.create({
              data: {
                productId: p.productId,
                productCategoryId: created.id,
                promotionPrice: p.promotionPrice ?? null,
                eventDiscountPercent: 0,
                order: p.order ?? (index + 1),
                isActive: true,
              },
            });
          }
        }

        return created;
      });

      return { id: category.id };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  // ────────── 카테고리 수정 (기준언어) ──────────

  async putProductCategory(id: number, dto: PutProductCategoryReqDto): Promise<string> {
    try {
      const defaultLang = this.settingService.getDefaultLanguage() as Language;
      await this.duplicateNameCheck(dto.name, defaultLang, id, false);

      const allDbCategory = await this.findAllCategoryDetailWithTranslation(id);
      const dbCategory = allDbCategory[defaultLang];
      if (!dbCategory) throw new CustomException('common.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'common.not_found' });

      const originName = dbCategory.name ?? '';
      const originImageCode = dbCategory.imageCode ?? '';

      let addChangedKeys: ChangedKey[] = [];
      if (!dto.isSimpleChange) {
        const translationDto = { name: dto.name, imageCode: dto.imageCode ?? '' };
        changedKeyFind(dbCategory, translationDto, this.findKeys);
        addChangedKeys = changeWordFind(translationDto).addChangedKeys;
      }

      for (const item of addChangedKeys) {
        if (!dbCategory.changedKeys.some((k: ChangedKey) => k.key === item.key)) dbCategory.changedKeys.push(item);
        else (dbCategory.changedKeys.find((k: ChangedKey) => k.key === item.key) as ChangedKey).changedAt = item.changedAt;
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.productCategory.update({
          where: { id },
          data: {
            categoryType: dto.categoryType,
            startDate: dto.startDate ?? null,
            endDate: dto.endDate ?? null,
            reservationStartDate: dto.reservationStartDate ?? null,
            reservationEndDate: dto.reservationEndDate ?? null,
            weekDay: dto.weekDay ?? [],
            isActive: dto.isActive,
            changedKeys: dbCategory.changedKeys || [],
          },
        });

        if (addChangedKeys.length > 0) {
          await tx.productCategoryTranslation.updateMany({
            where: { productCategoryId: id, language: { notIn: [defaultLang] } },
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


        await tx.productCategoryTranslation.upsert({
          where: { productCategoryId_language: { productCategoryId: id, language: defaultLang } },
          update: translationUpdate,
          create: { productCategoryId: id, language: defaultLang, name: dto.name, imageCode: dto.imageCode || null, isMatch: true, lastChangedAt: new Date() },
        });

        const ohterUpdate: any = {}
        if (!dto.name) ohterUpdate.name = null
        if (!dto.imageCode) ohterUpdate.imageCode = null
        await tx.productCategoryTranslation.updateMany({
          where: { productCategoryId: id, language: { notIn: [defaultLang] } },
          data: ohterUpdate,
        });

        const minLastChangedAt = await tx.productCategoryTranslation.findFirst({
          where: { productCategoryId: id, NOT: { language: defaultLang } },
          orderBy: { lastChangedAt: 'asc' },
          select: { language: true, lastChangedAt: true },
        });
        const newChangedKeys = dbCategory.changedKeys.filter((k: ChangedKey) => new Date(k.changedAt) > new Date(minLastChangedAt?.lastChangedAt ?? 0));
        await tx.productCategory.update({ where: { id }, data: { changedKeys: newChangedKeys } });

        if (dto.products !== undefined) {
          await tx.productToProductCategory.deleteMany({ where: { productCategoryId: id } });
          for (const [index, p] of dto.products.entries()) {
            await tx.productToProductCategory.create({
              data: {
                productId: p.productId,
                productCategoryId: id,
                promotionPrice: p.promotionPrice ?? null,
                eventDiscountPercent: 0,
                order: p.order ?? (index + 1),
                isActive: true,
              },
            });
          }
        }
      });

      return 'update product category success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }


  private async findAllCategoryDetailWithTranslation(id: number): Promise<any> {
    try {
      const category = await this.prisma.productCategory.findUnique({
        where: { id, deletedAt: null },
        include: {
          productCategoryTranslations: { select: { language: true, name: true, imageCode: true, image: { select: { code: true, name: true, path: true } }, isMatch: true, lastChangedAt: true } },
        },
      });
      if (!category) return {};
      const result: { [lang: string]: any } = {};
      for (const translation of category.productCategoryTranslations) {
        const { image, language, ...translationData } = translation as any;
        result[language] = { ...category, ...translationData, image: image, };
      }
      return result;
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }



  private getCategoryRestChangedFields(dbTranslationCategory: any, language: Language): ChangedKey[] {
    const translations = [...this.settingService.getSiteUseLanguages(), this.settingService.getPublicLanguage()]
      .filter((lang) => lang !== language)
      .map((lang) => dbTranslationCategory.productCategoryTranslations.find((t: any) => t.language === lang));
    const existingTranslations = translations.filter((t) => t != null);
    const minLastChangedAt = existingTranslations.some((t) => !t.name)
      ? null
      : existingTranslations.length > 0
        ? existingTranslations.map((t) => t.lastChangedAt).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]
        : null;
    return (dbTranslationCategory.changedKeys as ChangedKey[]).filter(
      (item) => new Date(item.changedAt) > new Date(minLastChangedAt ?? 0),
    );
  }

  private async findCategoryTranslationChangedFields(dbTranslationCategory: any, dto: { name: string; imageCode?: string }): Promise<void> {
    if (dbTranslationCategory.lastChangedAt) {
      const changeCheckFields = (dbTranslationCategory.changedKeys as ChangedKey[]).filter(
        (key) => new Date(key.changedAt) > new Date(dbTranslationCategory.lastChangedAt),
      );
      if (changeCheckFields.length > 0) {
        for (const item of changeCheckFields) {
          if ((dto as any)[item.key] == (dbTranslationCategory[item.key] ?? '')) {
            throw new CustomException('product.category.translation.name.notChanged', 'BAD_REQUEST', {
              field: item.key,
              fieldMessage: `product.category.translation.${item.key}.notChanged`,
            });
          }
        }
      }
    }
  }

  // ────────── 카테고리 수정 (공용언어) ──────────

  async putProductCategoryPublicTranslation(id: number, dto: PutProductCategoryPublicTranslationReqDto): Promise<string> {
    const { language, name, isSimpleChange = true } = dto;
    const defaultLang = this.settingService.getDefaultLanguage() as Language;
    const publicLang = this.settingService.getPublicLanguage() as Language;
    if (language === defaultLang && defaultLang !== publicLang) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: '기준 언어는 해당 엔드포인트로 수정 불가능합니다.' });
    if (this.settingService.getSiteUseLanguages().includes(language as Language)) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: '기타 언어는 해당 엔드포인트로 수정 불가능합니다.' });
    try {
      await this.duplicateNameCheck(name, language as Language, id, false);
      const allDbCategory = await this.findAllCategoryDetailWithTranslation(id);
      const defaultDbCategory = allDbCategory[defaultLang];
      if (!defaultDbCategory) throw new CustomException('common.not_found', 'BAD_REQUEST');
      const publicDbCategory = allDbCategory[publicLang];

      let addChangedKeys: ChangedKey[] = [];
      if (!isSimpleChange) {
        await this.findCategoryTranslationChangedFields(publicDbCategory, dto);
        const copyDto = JSON.parse(JSON.stringify({ name, imageCode: dto.imageCode ?? '' }));
        changedKeyFind(publicDbCategory, copyDto, this.findKeys);
        addChangedKeys = changeWordFind(copyDto).addChangedKeys;
      }

      const notMatchKeys = notMatchKeyFind(defaultDbCategory, dto, this.findKeys);
      if (notMatchKeys.length > 0) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: '공용언어 번역 데이터에 부족한 항목이 있습니다', field: notMatchKeys[0].key, fieldMessage: notMatchKeys[0].message });

      let restChangedFields: ChangedKey[] = [];
      if (publicDbCategory) {
        restChangedFields = this.getCategoryRestChangedFields(publicDbCategory, publicLang as Language);
      }

      for (const newKey of addChangedKeys) {
        const index = restChangedFields.findIndex((t) => t.key === newKey.key);
        if (index !== -1) restChangedFields[index].changedAt = newKey.changedAt;
        else restChangedFields.push(newKey);
      }

      await this.prisma.$transaction(async (tx) => {

        if (addChangedKeys.length > 0) {
          await tx.productCategoryTranslation.updateMany({
            where: { productCategoryId: id, language: { notIn: [defaultLang] } },
            data: { isMatch: false },
          });
        }
        if (publicDbCategory) {
          await tx.productCategory.update({ where: { id }, data: { changedKeys: restChangedFields } });
        }
        await tx.productCategoryTranslation.upsert({
          where: { productCategoryId_language: { productCategoryId: id, language: publicLang } },
          update: { name, imageCode: dto.imageCode || null, ...(dto.isView !== undefined ? { isView: dto.isView } : {}), isMatch: true, lastChangedAt: new Date() },
          create: { productCategoryId: id, language: publicLang, name, imageCode: dto.imageCode || null, isView: dto.isView ?? true, isMatch: true, lastChangedAt: new Date() },
        });
      });
      return 'update product category translation success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  // ────────── 카테고리 수정 (기타언어) ──────────

  async putProductCategoryTranslation(id: number, dto: PutProductCategoryTranslationReqDto): Promise<string> {
    const { language, name } = dto;
    if (language === (this.settingService.getDefaultLanguage() as Language) || language === (this.settingService.getPublicLanguage() as Language)) {
      throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: '기준언어 및 공용언어는 해당 엔드포인트로 수정 불가능합니다.' });
    }
    try {
      const defaultLang = this.settingService.getDefaultLanguage() as Language;
      await this.duplicateNameCheck(name, language as Language, id, false);
      const allDbCategory = await this.findAllCategoryDetailWithTranslation(id);
      const defaultDbCategory = allDbCategory[defaultLang as Language];
      if (!defaultDbCategory) throw new CustomException('common.not_found', 'BAD_REQUEST');
      const translationDbCategory = allDbCategory[language as Language];


      const sourceDbCategory = translationDbCategory ?? defaultDbCategory;
      const restChangedFields = this.getCategoryRestChangedFields(sourceDbCategory, language as Language);

      const notMatchKeys = notMatchKeyFind(defaultDbCategory, dto, this.findKeys);
      if (notMatchKeys.length > 0) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: '번역 데이터에 부족한 항목이 있습니다', field: notMatchKeys[0].key, fieldMessage: notMatchKeys[0].message });


      await this.prisma.$transaction(async (tx) => {
        await tx.productCategoryTranslation.upsert({
          where: { productCategoryId_language: { productCategoryId: id, language: language as Language } },
          update: { name, imageCode: dto.imageCode || null, ...(dto.isView !== undefined ? { isView: dto.isView } : {}), isMatch: true, lastChangedAt: new Date() },
          create: { productCategoryId: id, language: language as Language, name, imageCode: dto.imageCode || null, isView: dto.isView ?? true, isMatch: true, lastChangedAt: new Date() },
        });
        await tx.productCategory.update({ where: { id }, data: { changedKeys: restChangedFields } });
      });
      return 'update product category translation success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  // ────────── 카테고리 삭제 ──────────

  async deleteProductCategory(id: number): Promise<string> {
    try {
      const category = await this.prisma.productCategory.findUnique({
        where: { id },
        include: { productToProductCategories: true },
      });
      if (!category) throw new CustomException('product.category.not_found', 'BAD_REQUEST');
      if (category.productToProductCategories.length > 0) throw new CustomException('common.not_deleted_condition', 'NOT_DELETED_CONDITION');

      await this.prisma.$transaction(async (tx) => {
        await tx.productCategory.delete({ where: { id } });
        await this.orderHelper.reorderAfterDelete('productCategory', category.order, { deletedAt: null }, tx);
      });
      return 'delete product category success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  // ────────── 사용 여부 토글 ──────────

  async patchProductCategoryToggle(id: number, dto: UpdateToggleReqDto): Promise<string> {
    try {
      const category = await this.prisma.productCategory.findUnique({ where: { id } });
      if (!category) {
        throw new CustomException('common.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'common.not_found' });
      }

      await this.prisma.productCategory.update({ where: { id }, data: { isActive: dto.isActive } });
      return 'update product category toggle success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  // ────────── 순서 변경 ──────────

  async patchProductCategoryOrder(dto: PatchProductCategoryOrderReqDto): Promise<string> {
    try {
      const ids = dto.items.map((i) => i.id);
      const categories = await this.prisma.productCategory.findMany({
        where: { id: { in: ids } },
        select: { id: true, categoryType: true },
      });

      const mismatch = categories.filter((c) => c.categoryType !== dto.categoryType);
      if (mismatch.length > 0) {
        throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: `전달된 카테고리 중 ${dto.categoryType} 타입이 아닌 항목이 있습니다.` });
      }

      await this.prisma.$transaction(async (tx) => {
        for (const item of dto.items) {
          await tx.productCategory.update({ where: { id: item.id }, data: { order: item.order } });
        }
      });
      return 'update product category order success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

}
