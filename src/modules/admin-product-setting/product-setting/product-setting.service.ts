import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { CustomException } from '@common/exceptions';
import { Language } from '@prisma/client';
import { ProductType } from '@prisma/client';
import { SettingService } from '@src/core/setting/setting.service';
import { changedKeyFind, changeWordFind, notMatchKeyFind, ChangedKey } from '@common/utils/changed-key-find';
import { PaginatedResponseDto } from '@common/dto/pagination.dto';
import { CommonSetResponseDto } from '@common/dto/common-response.dto';
import { SetProductReqDto } from './dto/set-product/request.dto';
import { PutProductReqDto, PutProductTranslationReqDto, PutProductPublicTranslationReqDto } from './dto/put-product/request.dto';
import { GetProductListReqDto } from './dto/get-product/query.dto';
import { GetProductEventListResDto } from '../product-event-setting/dto/get-product-event/response.dto';
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
    { key: 'imageCode', defaultValue: '' },
  ];

  async duplicateNameCheck(name: string, language: Language, productId?: number, isSet: boolean = true): Promise<void> {
    // 삭제된거 제외
    const duplicateProduct = await this.prisma.productTranslation.findFirst({
      where: { name, language, product: { deletedAt: null }, ...(productId ? { productId: { not: productId } } : {}) },
    });
    if (duplicateProduct) throw new CustomException('product.name.duplicate', 'BAD_REQUEST', { field: `${isSet ? language + '.' : ''}name`, fieldMessage: 'product.name.duplicate' });
  }

  async getProductList(dto: GetProductListReqDto, headerLang: Language): Promise<PaginatedResponseDto<GetProductListResDto>> {
    try {
      const { productCategoryId, productType, activeTarget, name, notInputLanguage, isActive, code } = dto;
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
        ...(productType && { productType }),
        ...(activeTarget && { activeTarget: { has: activeTarget } }),
        ...(isActive !== undefined && { isActive }),
        ...(code && { id: { contains: code } }),
        ...notInputFilter,
      };
      if (productCategoryId) {
        where.productCategoryId = productCategoryId;
      }

      const translateWhere = {
        name: {
          contains: name,
        },
        language: headerLang,
      };

      const translationFilter = name ? { productTranslations: { some: translateWhere } } : {};

      const includeOption = {
        productTranslations: {
          select: { language: true, name: true, isMatch: true, lastChangedAt: true },
        },
        productCategory: {
          select: {
            productCategoryTranslations: { where: { language: { in: [headerLang, this.settingService.getDefaultLanguage() as any] } }, select: { language: true, name: true } },
          },
        },
      };

      let total: number;
      let data: any[];

      if (sort === 'name' || sort === 'categoryName') {
        const allForSort = await this.prisma.product.findMany({
          where: { ...where, ...translationFilter },
          select: {
            id: true,
            productTranslations: { where: { language: { in: [headerLang, this.settingService.getDefaultLanguage() as Language] } }, select: { name: true, language: true } },
            productCategory: {
              select: {
                productCategoryTranslations: { where: { language: { in: [headerLang, this.settingService.getDefaultLanguage() as Language] } }, select: { name: true, language: true } },
              },
            },
          },
        });

        allForSort.sort((a, b) => {
          let valA = '';
          let valB = '';
          if (sort === 'categoryName') {
            valA = pickTranslation(a.productCategory?.productCategoryTranslations ?? [], 'name', headerLang, headerLang) || '';
            valB = pickTranslation(b.productCategory?.productCategoryTranslations ?? [], 'name', headerLang, headerLang) || '';
          } else {
            valA = pickTranslation(a.productTranslations ?? [], 'name', headerLang, headerLang) || '';
            valB = pickTranslation(b.productTranslations ?? [], 'name', headerLang, headerLang) || '';
          }
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


        const categoryName = pickTranslation(item.productCategory?.productCategoryTranslations ?? [], 'name', headerLang, defaultLang)

        return {
          id: item.id,
          code: item.code,
          categoryName: categoryName,
          productType: item.productType,
          name: pickTranslation(item.productTranslations ?? [], 'name', headerLang, defaultLang),
          activeTarget: item.activeTarget,
          productPrice: item.productPrice,
          isTaxIncluded: item.isTaxIncluded,
          isVatView: item.isVatView,
          notInputLanguages,
          isActive: item.isActive,
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
            select: { language: true, name: true, description: true, imageCode: true, isMatch: true, lastChangedAt: true, image: { select: { code: true, name: true, path: true } } },
          },
          operationInfo: {
            include: {
              operationInfoTranslations: {
                where: { language: { in: [headerLang, this.settingService.getDefaultLanguage() as Language] } },
                select: { language: true, title: true },
              },
            },
          },
          productCategory: {
            include: {
              productCategoryTranslations: {
                where: { language: { in: [headerLang, this.settingService.getDefaultLanguage() as Language] } },
                select: { language: true, name: true },
              },
            },
          },
        },
      });

      if (!product) throw new CustomException('common.not_found', 'BAD_REQUEST');

      const defaultLang = this.settingService.getDefaultLanguage() as Language;
      const defaultTranslation = product.productTranslations.find((t) => t.language === defaultLang);

      const categoryName = pickTranslation(product.productCategory?.productCategoryTranslations ?? [], 'name', headerLang, defaultLang)

      const image = pickTranslation(product.productTranslations ?? [], 'image', defaultLang, defaultLang)
      const operationInfoTitle = pickTranslation(product.operationInfo?.operationInfoTranslations ?? [], 'title', headerLang, defaultLang) ?? null;

      return {
        id: product.id,
        code: product.code,
        productName: defaultTranslation?.name ?? '',
        productDescription: defaultTranslation?.description ?? '',
        productCategoryName: categoryName,
        productCategoryId: product.productCategoryId,
        productType: product.productType,
        productPrice: product.productPrice,
        productNote: product.productNote ?? '',
        activeTarget: product.activeTarget,
        isTaxIncluded: product.isTaxIncluded,
        isVatView: product.isVatView,
        isSleep: product.isSleep,
        isDisplay: product.isDisplay,
        isActive: product.isActive,
        membershipPeriod: product.membershipPeriod,
        membershipPrepayment: product.membershipPrepayment,
        membershipAddPrepayment: product.membershipAddPrepayment,
        membershipStartGradeId: product.membershipStartGradeId,
        operationInfoId: product.operationInfoId ?? null,
        operationInfoTitle,
        image: image ?? null,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      } as any;
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  async getProductEventList(id: number, headerLang: Language): Promise<GetProductEventListResDto[]> {
    try {
      const product = await this.prisma.product.findUnique({ where: { id, deletedAt: null } });
      if (!product) throw new CustomException('common.not_found', 'BAD_REQUEST');

      const defaultLang = this.settingService.getDefaultLanguage() as Language;
      const productEventList = await this.prisma.productEvent.findMany({
        where: { productToProductEvents: { some: { productId: id } } },
        include: {
          productEventTranslations: {
            select: { language: true, name: true },
          },
        },
      });

      const result = productEventList.map((item) => {
        return {
          id: item.id,
          code: item.code,
          name: pickTranslation(item.productEventTranslations ?? [], 'name', headerLang, defaultLang),
          eventType: item.eventType,
          weekDay: item.weekDay,
          startDate: item.startDate,
          endDate: item.endDate,
          isActive: item.isActive,
          createdAt: item.createdAt,
        } as GetProductEventListResDto;
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
            select: { language: true, name: true, description: true, imageCode: true, isMatch: true, lastChangedAt: true, image: { select: { code: true, name: true, path: true } } },
          },
        },
      });


      if (!product) throw new CustomException('common.not_found', 'BAD_REQUEST');

      const targetTranslation = product.productTranslations.find((t) => t.language === language) ?? null;

      // origin 정보 조회
      let originName = null;
      let originDescription = null;
      let originImage = null;
      let originImageCode = null;
      if (language === publicLang) {
        originName = pickTranslation(product.productTranslations ?? [], 'name', defaultLang, defaultLang)
        originDescription = pickTranslation(product.productTranslations ?? [], 'description', defaultLang, defaultLang)
        originImage = pickTranslation(product.productTranslations ?? [], 'image', defaultLang, defaultLang)
        originImageCode = pickTranslation(product.productTranslations ?? [], 'imageCode', defaultLang, defaultLang)
      } else {
        originName = pickTranslation(product.productTranslations ?? [], 'name', publicLang, defaultLang)
        originDescription = pickTranslation(product.productTranslations ?? [], 'description', publicLang, defaultLang)
        originImage = pickTranslation(product.productTranslations ?? [], 'image', publicLang, defaultLang)
        originImageCode = pickTranslation(product.productTranslations ?? [], 'imageCode', publicLang, defaultLang)
      }

      let notMatchKeys = notMatchKeyFind(
        { name: originName ?? '', description: originDescription ?? '', imageCode: originImageCode ?? '' },
        { name: targetTranslation?.name ?? '', description: targetTranslation?.description ?? '', imageCode: targetTranslation?.imageCode ?? '' },
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
        image: targetTranslation?.image ?? null,
        originName: originName ?? '',
        originDescription: originDescription ?? '',
        originImage: originImage ?? null,
        notMatchKeys,
      };
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
            productCategoryId: dto.productCategoryId ?? null,
            productType: dto.productType,
            productPrice: dto.productPrice,
            productNote: dto.productNote || null,
            activeTarget: dto.activeTarget,
            isTaxIncluded: dto.isTaxIncluded,
            isVatView: dto.isVatView,
            isSleep: (dto.productType === ProductType.goods || dto.productType === ProductType.membership) ? false : dto.isSleep,
            isDisplay: dto.isDisplay,
            isActive: dto.isActive,
            operationInfoId: dto.operationInfoId ?? null,
            changedKeys: [],
            ...(dto.productType === ProductType.membership && {
              membershipPeriod: dto.membershipPeriod ?? null,
              membershipPrepayment: dto.membershipPrepayment ?? null,
              membershipAddPrepayment: dto.membershipAddPrepayment ?? null,
              membershipStartGradeId: dto.membershipStartGradeId ?? null,
            }),
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
              data: { productId: created.id, language: transData.language, name: transData.name || null, description: transData.description || null, imageCode: transData.imageCode || null, isMatch: (notMatchKeys.length === 0), lastChangedAt: new Date() },
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
      const originImageCode = dbProduct.imageCode ?? '';

      let addChangedKeys: ChangedKey[] = [];
      if (!dto.isSimpleChange) {
        const translationDto = { name: dto.name, description: dto.description ?? '', imageCode: dto.imageCode ?? '' };
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
            productCategoryId: dto.productCategoryId ?? null,
            productType: dto.productType,
            productPrice: dto.productPrice,
            productNote: dto.productNote ?? null,
            activeTarget: dto.activeTarget,
            isTaxIncluded: dto.isTaxIncluded,
            isVatView: dto.isVatView,
            isSleep: dto.isSleep,
            isDisplay: dto.isDisplay,
            isActive: dto.isActive,
            membershipPeriod: dto.membershipPeriod ?? null,
            membershipPrepayment: dto.membershipPrepayment ?? null,
            membershipAddPrepayment: dto.membershipAddPrepayment ?? null,
            membershipStartGradeId: dto.membershipStartGradeId ?? null,
            operationInfoId: dto.operationInfoId ?? null,
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
        const imageCodeChanged = (dto.imageCode || '') !== originImageCode;
        const translationUpdate: any = (nameChanged || descChanged || imageCodeChanged) ? {
          ...(nameChanged ? { name: dto.name } : {}),
          ...(descChanged ? { description: dto.description || null } : {}),
          ...(imageCodeChanged ? { imageCode: dto.imageCode || null } : {}),
          isMatch: true,
          lastChangedAt: new Date(),
        } : {};
        await tx.productTranslation.upsert({
          where: { productId_language: { productId: id, language: defaultLang } },
          update: translationUpdate,
          create: { productId: id, language: defaultLang, name: dto.name, description: dto.description ?? null, imageCode: dto.imageCode || null, isMatch: true, lastChangedAt: new Date() },
        });

        const ohterUpdate: any = {}
        if (!dto.name) ohterUpdate.name = null
        if (!dto.description) ohterUpdate.description = null
        if (!dto.imageCode) ohterUpdate.imageCode = null
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
            select: { language: true, name: true, description: true, imageCode: true, isMatch: true, lastChangedAt: true, image: { select: { code: true, name: true, path: true } } },
          },
        },
      });
      if (!product) return {};
      const result: { [lang: string]: any } = {};
      for (const translation of product.productTranslations) {
        const { image, language, ...translationData } = translation as any;
        result[language] = { ...product, ...translationData, image: image, };
      }
      return result;
    } catch (error) {
      console.log(error);
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  // 기준언어 제외 번역 정보 중 미매칭 정보 조회
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

  // 번역 정보 변경 필드 조회
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
    const { language, name, description, isSimpleChange = true } = dto;
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
        const copyDto = JSON.parse(JSON.stringify({ name, description: description ?? '', imageCode: dto.imageCode ?? '' }));
        changedKeyFind(publicDbProduct, copyDto, this.findKeys);
        addChangedKeys = changeWordFind(copyDto).addChangedKeys;
      }

      // 기준언어에 있는데 변경 데이터에 없으면 에러
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
          update: { name, description: description ?? null, imageCode: dto.imageCode || null, isMatch: true, lastChangedAt: new Date() },
          create: { productId: id, language: publicLang, name, description: description ?? null, imageCode: dto.imageCode || null, isMatch: true, lastChangedAt: new Date() },
        });
      });
      return 'update product translation success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  async putProductTranslation(id: number, dto: PutProductTranslationReqDto): Promise<string> {
    const { language, name, description } = dto;
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
          update: { name, description: description || null, imageCode: dto.imageCode || null, isMatch: true, lastChangedAt: new Date() },
          create: { productId: id, language: language as Language, name, description: description ?? null, imageCode: dto.imageCode || null, isMatch: true, lastChangedAt: new Date() },
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
      const productEventList = await this.prisma.productEvent.findMany({ where: { productToProductEvents: { some: { productId: id } } } });
      if (productEventList.length > 0) throw new CustomException('common.not_deleted_condition', 'NOT_DELETED_CONDITION');
      await this.prisma.$transaction(async (tx) => {
        const eventEntries = await tx.productToProductEvent.findMany({ where: { productId: id }, select: { order: true, productEventId: true } });
        await tx.productToProductEvent.deleteMany({ where: { productId: id } });
        await tx.product.update({ where: { id }, data: { deletedAt: new Date() } });
        for (const entry of eventEntries) {
          await this.orderHelper.reorderAfterDelete('productToProductEvent', entry.order, { productEventId: entry.productEventId }, tx);
        }
      });
      return 'delete product success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }
}
