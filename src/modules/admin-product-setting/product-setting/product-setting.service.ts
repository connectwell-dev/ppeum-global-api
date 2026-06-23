import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { CustomException } from '@common/exceptions';
import { Language } from '@prisma/client';
import { SettingService } from '@src/core/setting/setting.service';
import { changedKeyFind, changeWordFind, notMatchKeyFind, ChangedKey } from '@common/utils/changed-key-find';
import { PaginatedResponseDto } from '@common/dto/pagination.dto';
import { CommonSetResponseDto } from '@common/dto/common-response.dto';
import { SetProductReqDto } from './dto/set-product/request.dto';
import { PutProductReqDto, PutProductTranslationReqDto, PutProductPublicTranslationReqDto } from './dto/put-product/request.dto';
import { GetProductListReqDto } from './dto/get-product/query.dto';
import { GetProductCategoryListResDto } from '../product-category-setting/dto/get-product-category/response.dto';
import { GetProductDetailResDto, GetProductListResDto, GetProductTranslationResDto } from './dto/get-product/response.dto';
import { ERROR_MESSAGE } from '@common/constants/error-message';
import { pickTranslation } from '@common/utils/translation-utils';
import { OrderHelper } from '@src/core/helpers/order.helper';
import { Public } from '@common/decorators/public.decorator';

@Public()
@Injectable()
export class ProductSettingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingService: SettingService,
    private readonly orderHelper: OrderHelper,
  ) { }
  findKeys = [
    { key: 'name', defaultValue: '' },
    { key: 'description', defaultValue: '' },
  ];

  async duplicateNameCheck(name: string, language: Language, productId?: number, isSet: boolean = true): Promise<void> {
    const duplicateProduct = await this.prisma.productTranslation.findFirst({
      where: { name, language, product: { deletedAt: null }, ...(productId ? { productId: { not: productId } } : {}) },
    });
    if (duplicateProduct) throw new CustomException('product.name.duplicate', 'BAD_REQUEST', { field: `${isSet ? language + '.' : ''}name`, fieldMessage: 'product.name.duplicate' });
  }

  async getProductList(dto: GetProductListReqDto, headerLang: Language): Promise<PaginatedResponseDto<GetProductListResDto>> {
    try {
      const { name, notInputLanguage, isActive, code } = dto;
      const page = dto.page ?? 1;
      const rowCount = dto.rowCount ?? 10;
      const sort = dto.sort ?? 'createdAt';
      const order = dto.order ?? 'desc';

      if (notInputLanguage === (this.settingService.getDefaultLanguage() as Language)) return { total: 0, page: 1, totalPage: 1, data: [] };

      const notInputFilter = notInputLanguage
        ? {
          OR: [
            { NOT: { productTranslations: { some: { language: notInputLanguage } } } },
            { productTranslations: { some: { language: notInputLanguage, isMatch: false } } },
          ],
        }
        : {};

      const where: any = {
        deletedAt: null,
        ...(isActive !== undefined && { isActive }),
        ...(code && { id: { contains: code } }),
        ...(dto.productGroupId && { productGroupId: dto.productGroupId }),
        ...notInputFilter,
      };

      const translateWhere = {
        name: { contains: name },
        language: headerLang,
      };

      const translationFilter = name ? { productTranslations: { some: translateWhere } } : {};

      const includeOption = {
        productTranslations: {
          select: { language: true, name: true, isMatch: true, lastChangedAt: true },
        },
      };

      let total: number;
      let data: any[];

      if (sort === 'name') {
        const allForSort = await this.prisma.product.findMany({
          where: { ...where, ...translationFilter },
          select: {
            id: true,
            productTranslations: { where: { language: { in: [headerLang, this.settingService.getDefaultLanguage() as Language] } }, select: { name: true, language: true } },
          },
        });

        allForSort.sort((a, b) => {
          const valA = pickTranslation(a.productTranslations ?? [], 'name', headerLang, headerLang) || '';
          const valB = pickTranslation(b.productTranslations ?? [], 'name', headerLang, headerLang) || '';
          return order === 'asc' ? valA.localeCompare(valB, headerLang) : valB.localeCompare(valA, headerLang);
        });

        total = allForSort.length;
        const paginatedIds = allForSort.slice((page - 1) * rowCount, page * rowCount).map((p) => p.id);
        const rawData = await this.prisma.product.findMany({ where: { id: { in: paginatedIds } }, include: includeOption });
        data = paginatedIds.map((id) => rawData.find((p) => p.id === id)!);
      } else {
        [total, data] = await Promise.all([
          this.prisma.product.count({ where: { ...where, ...translationFilter } }),
          this.prisma.product.findMany({
            where: { ...where, ...translationFilter },
            include: includeOption,
            skip: (page - 1) * rowCount,
            take: rowCount,
            orderBy: { [sort]: order },
          }),
        ]);
      }

      const totalPage = Math.ceil(total / rowCount) || 1;
      const defaultLang = this.settingService.getDefaultLanguage() as Language;

      const result = data.map((item) => {
        const notInputLanguages: Language[] = [];
        for (const lang of [...this.settingService.getSiteUseLanguages(), this.settingService.getPublicLanguage()] as Language[]) {
          const translation = item.productTranslations.find((t) => t.language === lang);
          if (!translation || !translation.isMatch) notInputLanguages.push(lang);
        }

        return {
          id: item.id,
          code: item.code,
          name: pickTranslation(item.productTranslations ?? [], 'name', headerLang, defaultLang),
          productPrice: item.productPrice,
          eventPrice: item.eventPrice ?? null,
          startDate: item.startDate ?? null,
          endDate: item.endDate ?? null,
          notInputLanguages,
          isActive: item.isActive,
          productGroupId: item.productGroupId ?? null,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };
      });

      return { total, page, totalPage, data: result as GetProductListResDto[] };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  async getProductDetail(id: number, headerLang: Language): Promise<GetProductDetailResDto> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id, deletedAt: null },
        include: {
          productTranslations: {
            select: { language: true, name: true, description: true, imageCode: true, image: { select: { code: true, name: true, path: true } }, isView: true, isMatch: true, lastChangedAt: true },
          },
          productDetailInfo: {
            include: {
              productDetailInfoTranslations: {
                where: { language: { in: [headerLang, this.settingService.getDefaultLanguage() as Language] } },
                select: { language: true, title: true },
              },
            },
          },
        },
      });

      if (!product) throw new CustomException('common.not_found', 'BAD_REQUEST');

      const defaultLang = this.settingService.getDefaultLanguage() as Language;
      const defaultTranslation = product.productTranslations.find((t) => t.language === defaultLang);

      const productDetailInfoTitle = pickTranslation(product.productDetailInfo?.productDetailInfoTranslations ?? [], 'title', headerLang, defaultLang) ?? null;

      return {
        id: product.id,
        code: product.code,
        productName: defaultTranslation?.name ?? '',
        productDescription: defaultTranslation?.description ?? '',
        productPrice: product.productPrice,
        eventPrice: product.eventPrice ?? null,
        image: defaultTranslation?.image ?? null,
        startDate: product.startDate ?? null,
        endDate: product.endDate ?? null,
        isActive: product.isActive,
        isView: defaultTranslation?.isView ?? true,
        productGroupId: product.productGroupId ?? null,
        productDetailInfoId: product.productDetailInfoId ?? null,
        productDetailInfoTitle,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      } as any;
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  async getProductCategoryList(id: number, headerLang: Language): Promise<GetProductCategoryListResDto[]> {
    try {
      const product = await this.prisma.product.findUnique({ where: { id, deletedAt: null } });
      if (!product) throw new CustomException('common.not_found', 'BAD_REQUEST');

      const defaultLang = this.settingService.getDefaultLanguage() as Language;
      const categoryList = await this.prisma.productCategory.findMany({
        where: { productToProductCategories: { some: { productId: id } } },
        include: {
          productCategoryTranslations: {
            select: { language: true, name: true },
          },
        },
      });

      const result = categoryList.map((item) => {
        return {
          id: item.id,
          code: item.code,
          name: pickTranslation(item.productCategoryTranslations ?? [], 'name', headerLang, defaultLang),
          categoryType: item.categoryType,
          weekDay: item.weekDay,
          startDate: item.startDate,
          endDate: item.endDate,
          isActive: item.isActive,
          createdAt: item.createdAt,
        } as GetProductCategoryListResDto;
      });
      return result;
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  async getProductTranslation(id: number, language: Language, headerLang: Language): Promise<GetProductTranslationResDto> {
    const defaultLang = this.settingService.getDefaultLanguage() as Language;
    const publicLang = this.settingService.getPublicLanguage() as Language;
    try {
      const product = await this.prisma.product.findUnique({
        where: { id, deletedAt: null },
        select: {
          changedKeys: true,
          productTranslations: {
            select: { language: true, name: true, description: true, imageCode: true, image: { select: { code: true, name: true, path: true } }, isView: true, isMatch: true, lastChangedAt: true },
          },
        },
      });

      if (!product) throw new CustomException('common.not_found', 'BAD_REQUEST');

      const targetTranslation = product.productTranslations.find((t) => t.language === language) ?? null;
      const defaultImage = pickTranslation(product.productTranslations ?? [], 'image', defaultLang, defaultLang) ?? null;

      let originName = null;
      let originDescription = null;
      let originImage = null;
      if (language === publicLang) {
        originName = pickTranslation(product.productTranslations ?? [], 'name', defaultLang, defaultLang)
        originDescription = pickTranslation(product.productTranslations ?? [], 'description', defaultLang, defaultLang)
        originImage = pickTranslation(product.productTranslations ?? [], 'image', defaultLang, defaultLang)
      } else {
        originName = pickTranslation(product.productTranslations ?? [], 'name', publicLang, defaultLang)
        originDescription = pickTranslation(product.productTranslations ?? [], 'description', publicLang, defaultLang)
        originImage = pickTranslation(product.productTranslations ?? [], 'image', publicLang, defaultLang)
      }

      let notMatchKeys = notMatchKeyFind(
        { name: originName ?? '', description: originDescription ?? '' },
        { name: targetTranslation?.name ?? '', description: targetTranslation?.description ?? '' },
        this.findKeys,
      );
      notMatchKeys = notMatchKeys.map((item) => ({ ...item, message: ERROR_MESSAGE[item.message]?.[headerLang] }));

      if (targetTranslation?.lastChangedAt) {
        const changedKeys = (product.changedKeys as ChangedKey[]).filter((k) => new Date(k.changedAt) > new Date(targetTranslation.lastChangedAt!));
        for (const item of changedKeys) {
          if (!notMatchKeys.find((k) => k.key === item.key))
            notMatchKeys.push({ key: item.key, message: ERROR_MESSAGE['common.translation_not_updated']?.[headerLang] });
        }
      }

      return {
        name: targetTranslation?.name ?? '',
        description: targetTranslation?.description ?? '',
        image: targetTranslation?.image ?? defaultImage,
        isView: targetTranslation?.isView ?? true,
        originName: originName ?? '',
        originDescription: originDescription ?? '',
        originImage: originImage ?? null,
        notMatchKeys,
      } as any;
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  async setProduct(dto: SetProductReqDto): Promise<CommonSetResponseDto> {
    try {
      for (const t of dto.productTranslations ?? []) {
        if (t.name) await this.duplicateNameCheck(t.name, t.language);
      }
      const defaultLang = this.settingService.getDefaultLanguage() as Language;
      const defaultData = dto.productTranslations?.find((t) => t.language === defaultLang);
      if (!defaultData?.name) throw new CustomException('product.name.required', 'BAD_REQUEST', { field: `name.${defaultLang}`, fieldMessage: 'product.name.required' });
      const product = await this.prisma.$transaction(async (tx) => {
        const created = await tx.product.create({
          data: {
            productPrice: dto.productPrice,
            eventPrice: dto.eventPrice ?? null,
            startDate: dto.startDate || null,
            endDate: dto.endDate || null,
            isActive: dto.isActive,
            productDetailInfoId: dto.productDetailInfoId ?? null,
            changedKeys: [],
          },
        });

        for (const transData of dto.productTranslations ?? []) {
          if (transData) {
            let notMatchKeys = notMatchKeyFind(
              defaultData,
              transData,
              this.findKeys,
            );
            await tx.productTranslation.create({
              data: { productId: created.id, language: transData.language, name: transData.name || null, description: transData.description || null, imageCode: transData.imageCode || null, isView: transData.isView ?? true, isMatch: (notMatchKeys.length === 0), lastChangedAt: new Date() },
            });
          }
        }

        return created;
      });

      return { id: product.id };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  async putProduct(id: number, dto: PutProductReqDto): Promise<string> {
    try {
      const defaultLang = this.settingService.getDefaultLanguage() as Language;
      await this.duplicateNameCheck(dto.name, defaultLang, id, false);

      const allDbProduct = await this.findAllProductDetailWithTranslation(id);
      const dbProduct = allDbProduct[defaultLang];
      if (!dbProduct) throw new CustomException('common.not_found', 'BAD_REQUEST');
      const originName = dbProduct.name ?? '';
      const originDesc = dbProduct.description ?? '';

      let addChangedKeys: ChangedKey[] = [];
      if (!dto.isSimpleChange) {
        const translationDto = { name: dto.name, description: dto.description ?? '' };
        changedKeyFind(dbProduct, translationDto, this.findKeys);
        addChangedKeys = changeWordFind(translationDto).addChangedKeys;
      }

      for (const item of addChangedKeys) {
        if (!dbProduct.changedKeys.some((k: ChangedKey) => k.key === item.key)) dbProduct.changedKeys.push(item);
        else (dbProduct.changedKeys.find((k: ChangedKey) => k.key === item.key) as ChangedKey).changedAt = item.changedAt;
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id },
          data: {
            productPrice: dto.productPrice,
            eventPrice: dto.eventPrice ?? null,
            startDate: dto.startDate || null,
            endDate: dto.endDate || null,
            isActive: dto.isActive,
            productDetailInfoId: dto.productDetailInfoId ?? null,
            changedKeys: dbProduct.changedKeys || [],
          },
        });

        if (addChangedKeys.length > 0) {
          await tx.productTranslation.updateMany({
            where: { productId: id, language: { notIn: [defaultLang] } },
            data: { isMatch: false },
          });
        }

        const nameChanged = dto.name !== originName;
        const descChanged = (dto.description ?? '') !== originDesc;
        const translationUpdate: any = {
          ...((nameChanged || descChanged) ? {
            ...(nameChanged ? { name: dto.name } : {}),
            ...(descChanged ? { description: dto.description || null } : {}),
            isMatch: true,
            lastChangedAt: new Date(),
          } : {}),
          imageCode: dto.imageCode || null,
          isView: dto.isView ?? true,
        };
        await tx.productTranslation.upsert({
          where: { productId_language: { productId: id, language: defaultLang } },
          update: translationUpdate,
          create: { productId: id, language: defaultLang, name: dto.name, description: dto.description ?? null, imageCode: dto.imageCode || null, isView: dto.isView ?? true, isMatch: true, lastChangedAt: new Date() },
        });

        const ohterUpdate: any = {}
        if (!dto.name) ohterUpdate.name = null
        if (!dto.description) ohterUpdate.description = null
        await tx.productTranslation.updateMany({
          where: { productId: id, language: { notIn: [defaultLang] } },
          data: ohterUpdate,
        });

        const minLastChangedAt = await tx.productTranslation.findFirst({
          where: { productId: id, NOT: { language: defaultLang } },
          orderBy: { lastChangedAt: 'asc' },
          select: { language: true, lastChangedAt: true },
        });
        const newChangedKeys = dbProduct.changedKeys.filter((k: ChangedKey) => new Date(k.changedAt) > new Date(minLastChangedAt?.lastChangedAt ?? 0));
        await tx.product.update({ where: { id }, data: { changedKeys: newChangedKeys } });
      });

      return 'update product success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  private async findAllProductDetailWithTranslation(id: number): Promise<any> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id, deletedAt: null },
        include: {
          productTranslations: {
            select: { language: true, name: true, description: true, isMatch: true, lastChangedAt: true },
          },
        },
      });
      if (!product) return {};
      const result: { [lang: string]: any } = {};
      for (const translation of product.productTranslations) {
        const { language, ...translationData } = translation as any;
        result[language] = { ...product, ...translationData };
      }
      return result;
    } catch (error) {
      console.log(error);
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  private getRestChangedFields(dbData: any, language: Language): ChangedKey[] {
    const translations = [...this.settingService.getSiteUseLanguages(), this.settingService.getPublicLanguage()]
      .filter((lang) => lang !== language)
      .map((lang) => dbData.productTranslations.find((t: any) => t.language === lang));
    const existingTranslations = translations.filter((t) => t != null);
    const minLastChangedAt = existingTranslations.some((t) => !t.name)
      ? null
      : existingTranslations.length > 0
        ? existingTranslations.map((t) => t.lastChangedAt).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]
        : null;
    return (dbData.changedKeys as ChangedKey[]).filter(
      (item) => new Date(item.changedAt) > new Date(minLastChangedAt ?? 0),
    );
  }

  private async findProductTranslationChangedFields(dbData: any, dto: { name: string; description?: string }): Promise<void> {
    if (dbData.lastChangedAt) {
      const changeCheckFields = (dbData.changedKeys as ChangedKey[]).filter(
        (key) => new Date(key.changedAt) > new Date(dbData.lastChangedAt),
      );
      if (changeCheckFields.length > 0) {
        for (const item of changeCheckFields) {
          if ((dto as any)[item.key] == (dbData[item.key] ?? '')) {
            throw new CustomException(`product.translation.${item.key}.notChanged`, 'BAD_REQUEST', {
              field: item.key,
              fieldMessage: `product.translation.${item.key}.notChanged`,
            });
          }
        }
      }
    }
  }

  async putProductPublicTranslation(id: number, dto: PutProductPublicTranslationReqDto): Promise<string> {
    const { language, name, description, imageCode, isSimpleChange = true } = dto;
    const defaultLang = this.settingService.getDefaultLanguage() as Language;
    const publicLang = this.settingService.getPublicLanguage() as Language;
    if (language === defaultLang && defaultLang !== publicLang) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: '기준 언어는 해당 엔드포인트로 수정 불가능합니다.' });
    if (this.settingService.getSiteUseLanguages().includes(language as Language)) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: '기타 언어는 해당 엔드포인트로 수정 불가능합니다.' });
    try {
      await this.duplicateNameCheck(name, language as Language, id, false);
      const allDbProduct = await this.findAllProductDetailWithTranslation(id);
      const defaultDbProduct: any = allDbProduct[defaultLang as Language];
      if (!defaultDbProduct) throw new CustomException('common.not_found', 'BAD_REQUEST');
      const publicDbProduct: any = allDbProduct[publicLang as Language];

      let addChangedKeys: ChangedKey[] = [];
      if (!isSimpleChange) {
        await this.findProductTranslationChangedFields(publicDbProduct, dto);
        const copyDto = JSON.parse(JSON.stringify({ name, description: description ?? '' }));
        changedKeyFind(publicDbProduct, copyDto, this.findKeys);
        addChangedKeys = changeWordFind(copyDto).addChangedKeys;
      }

      let notMatchKeys = notMatchKeyFind(defaultDbProduct, dto, this.findKeys);
      if (notMatchKeys.length > 0) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: '공용언어 번역 데이터에 부족한 항목이 있습니다', field: notMatchKeys[0].key, fieldMessage: notMatchKeys[0].message });

      let restChangedFields: ChangedKey[] = [];
      if (publicDbProduct) {
        restChangedFields = this.getRestChangedFields(publicDbProduct, publicLang as Language);
      }

      for (const newKey of addChangedKeys) {
        const index = restChangedFields.findIndex((t) => t.key === newKey.key);
        if (index !== -1) restChangedFields[index].changedAt = newKey.changedAt;
        else restChangedFields.push(newKey);
      }

      await this.prisma.$transaction(async (tx) => {
        if (addChangedKeys.length > 0) {
          await tx.productTranslation.updateMany({
            where: { productId: id, language: { notIn: [defaultLang] } },
            data: { isMatch: false },
          });
        }
        if (publicDbProduct) {
          await tx.product.update({ where: { id }, data: { changedKeys: restChangedFields } });
        }
        await tx.productTranslation.upsert({
          where: { productId_language: { productId: id, language: publicLang } },
          update: { name, description: description ?? null, imageCode: imageCode || null, isView: dto.isView ?? true, isMatch: true, lastChangedAt: new Date() },
          create: { productId: id, language: publicLang, name, description: description ?? null, imageCode: imageCode || null, isView: dto.isView ?? true, isMatch: true, lastChangedAt: new Date() },
        });
      });
      return 'update product translation success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  async putProductTranslation(id: number, dto: PutProductTranslationReqDto): Promise<string> {
    const { language, name, description, imageCode } = dto;
    if (language === this.settingService.getDefaultLanguage() as Language || language === this.settingService.getPublicLanguage() as Language) {
      throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: '기준언어 및 공용언어는 해당 엔드포인트로 수정 불가능합니다.' });
    }
    try {
      const defaultLang = this.settingService.getDefaultLanguage() as Language;
      await this.duplicateNameCheck(name, language as Language, id, false);
      const allDbProduct: any = await this.findAllProductDetailWithTranslation(id);
      const defaultDbProduct: any = allDbProduct[defaultLang as Language];
      if (!defaultDbProduct) throw new CustomException('common.not_found', 'BAD_REQUEST');
      const translationDbProduct: any = allDbProduct[language as Language];

      const sourceDbProduct = translationDbProduct ?? defaultDbProduct;
      const restChangedFields = this.getRestChangedFields(sourceDbProduct, language as Language);

      const notMatchKeys = notMatchKeyFind(defaultDbProduct, dto, this.findKeys);
      if (notMatchKeys.length > 0) throw new CustomException('common.invalid_request', 'BAD_REQUEST', { messageDetail: '번역 데이터에 부족한 항목이 있습니다', field: notMatchKeys[0].key, fieldMessage: notMatchKeys[0].message });

      await this.prisma.$transaction(async (tx) => {
        await tx.productTranslation.upsert({
          where: { productId_language: { productId: id, language: language as Language } },
          update: { name, description: description || null, imageCode: imageCode || null, isView: dto.isView ?? true, isMatch: true, lastChangedAt: new Date() },
          create: { productId: id, language: language as Language, name, description: description ?? null, imageCode: imageCode || null, isView: dto.isView ?? true, isMatch: true, lastChangedAt: new Date() },
        });
        await tx.product.update({ where: { id }, data: { changedKeys: restChangedFields } });
      });
      return 'update product translation success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  async deleteProduct(id: number): Promise<string> {
    try {
      const categoryList = await this.prisma.productCategory.findMany({ where: { productToProductCategories: { some: { productId: id } } } });
      if (categoryList.length > 0) throw new CustomException('common.not_deleted_condition', 'NOT_DELETED_CONDITION');
      await this.prisma.$transaction(async (tx) => {
        const categoryEntries = await tx.productToProductCategory.findMany({ where: { productId: id }, select: { order: true, productCategoryId: true } });
        await tx.productToProductCategory.deleteMany({ where: { productId: id } });
        await tx.product.update({ where: { id }, data: { deletedAt: new Date() } });
        for (const entry of categoryEntries) {
          await this.orderHelper.reorderAfterDelete('productToProductCategory', entry.order, { productCategoryId: entry.productCategoryId }, tx);
        }
      });
      return 'delete product success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }
}
