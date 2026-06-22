import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { CustomException } from '@common/exceptions';
import { OrderHelper } from '@src/core/helpers/order.helper';
import { PatchProductCategoryStatusReqDto } from './dto/patch-product-category/request.dto';
import { CommonSetResponseDto } from '@common/dto/common-response.dto';
import { GetProductCategoryProductListResDto } from './dto/get-product-category-product/response.dto';
import { SetProductCategoryReqDto } from './dto/set-product-category/request.dto';
import { SettingService } from '@src/core/setting/setting.service';
import { Language } from '@prisma/client';
import { pickTranslation } from '@common/utils/translation-utils';
import { GetProductCategoryListResDto } from './dto/get-product-category/response.dto';

@Injectable()
export class ProductCategorySettingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderHelper: OrderHelper,
    private readonly settingService: SettingService,
  ) { }

  // ────────── 공통 헬퍼 ──────────

  private async duplicateNameCheck(translations: { language: string; name: string }[], excludeId?: number): Promise<void> {
    for (const t of translations) {
      const existing = await this.prisma.productCategoryTranslation.findFirst({
        where: {
          language: t.language as any,
          name: t.name,
          productCategory: { deletedAt: null },
          ...(excludeId ? { productCategoryId: { not: excludeId } } : {}),
        },
      });
      if (existing) {
        throw new CustomException('product.category.name.duplicate', 'BAD_REQUEST', { field: `name.${t.language}`, fieldMessage: 'product.category.name.duplicate', });
      }
    }
  }

  // ────────── 조회 ──────────

  async getProductCategoryList(headerLang: Language): Promise<GetProductCategoryListResDto[]> {
    try {
      const list = await this.prisma.productCategory.findMany({
        where: { deletedAt: null },
        include: { productCategoryTranslations: { select: { language: true, name: true } } },
        orderBy: { order: 'asc' },
      });

      return list.map(({ productCategoryTranslations, ...rest }) => ({
        id: rest.id,
        order: rest.order,
        isActive: rest.isActive,
        name: pickTranslation(productCategoryTranslations ?? [], 'name', headerLang, this.settingService.getDefaultLanguage() as Language) ?? '',
      }));
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async getProductCategoryDetail(id: number): Promise<GetProductCategoryListResDto> {
    try {
      const category = await this.prisma.productCategory.findFirst({
        where: { id, deletedAt: null },
        include: { productCategoryTranslations: { select: { language: true, name: true } } },
      });

      if (!category) {
        throw new CustomException('common.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'common.not_found' });
      }

      const { productCategoryTranslations, ...rest } = category;
      return { ...rest, translations: productCategoryTranslations } as any;
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async getProductCategoryProductList(id: number, headerLang: Language): Promise<GetProductCategoryProductListResDto[]> {
    try {
      const category = await this.prisma.productCategory.findFirst({
        where: { id, deletedAt: null },
        include: { productCategoryTranslations: { select: { language: true, name: true } } },
      });
      if (!category) throw new CustomException('common.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'common.not_found' });

      const defaultLang = this.settingService.getDefaultLanguage() as Language;
      const categoryName = pickTranslation(category.productCategoryTranslations ?? [], 'name', headerLang, defaultLang)

      const products = await this.prisma.product.findMany({
        where: { productCategoryId: id, deletedAt: null },
        include: { productTranslations: { select: { language: true, name: true } } },
      });

      return products.map(({ productTranslations, ...rest }) => {
        const name = pickTranslation(productTranslations ?? [], 'name', headerLang, defaultLang)
        return { id: rest.id, code: rest.code, categoryName, name };
      }) as GetProductCategoryProductListResDto[];
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  // ────────── 등록/수정/삭제 ──────────

  async setProductCategory(dto: SetProductCategoryReqDto): Promise<CommonSetResponseDto> {
    try {
      if (!dto.translations.find(t => t.language === this.settingService.getDefaultLanguage())) throw new CustomException('product.category.name.required', 'BAD_REQUEST', { field: `name.${this.settingService.getDefaultLanguage()}`, fieldMessage: 'product.category.name.required' });
      await this.duplicateNameCheck(dto.translations);

      const created = await this.prisma.$transaction(async (tx) => {
        const order = await this.orderHelper.getNextOrder('productCategory', { deletedAt: null }, tx);
        const category = await tx.productCategory.create({
          data: { order, isActive: dto.isActive },
        });
        for (const t of dto.translations) {
          await tx.productCategoryTranslation.create({
            data: { productCategoryId: category.id, language: t.language as any, name: t.name },
          });
        }
        return category;
      });

      return { id: created.id };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async putProductCategory(id: number, dto: SetProductCategoryReqDto): Promise<string> {
    try {
      const category = await this.prisma.productCategory.findFirst({ where: { id, deletedAt: null } });
      if (!category) throw new CustomException('common.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'common.not_found' });
      if (!dto.translations.find(t => t.language === this.settingService.getDefaultLanguage())) throw new CustomException('product.category.name.required', 'BAD_REQUEST', { field: `name.${this.settingService.getDefaultLanguage()}`, fieldMessage: 'product.category.name.required' });
      await this.duplicateNameCheck(dto.translations, id);

      await this.prisma.$transaction(async (tx) => {
        await tx.productCategory.update({ where: { id }, data: { isActive: dto.isActive } });
        for (const t of dto.translations) {
          await tx.productCategoryTranslation.upsert({
            where: { productCategoryId_language: { productCategoryId: id, language: t.language as any } },
            update: { name: t.name },
            create: { productCategoryId: id, language: t.language as any, name: t.name },
          });
        }
      });

      return 'update product category success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async deleteProductCategory(id: number): Promise<string> {
    try {
      const category = await this.prisma.productCategory.findFirst({ where: { id, deletedAt: null } });
      if (!category) throw new CustomException('common.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'common.not_found' });

      const productCheck = await this.prisma.product.findFirst({ where: { productCategoryId: id, deletedAt: null } });
      if (productCheck) throw new CustomException('common.not_deleted_condition', 'NOT_DELETED_CONDITION');

      await this.prisma.$transaction(async (tx) => {
        await tx.productCategory.update({ where: { id }, data: { deletedAt: new Date(), order: 0 } });
        await this.orderHelper.reorderAfterDelete('productCategory', category.order, { deletedAt: null }, tx);
      });

      return 'delete product category success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  // ────────── 순서/사용여부 일괄 ──────────

  async patchProductCategoryStatus(dto: PatchProductCategoryStatusReqDto): Promise<string> {
    try {
      await this.prisma.$transaction(async (tx) => {
        for (const item of dto.items) {
          await tx.productCategory.update({ where: { id: item.id }, data: { order: item.order, isActive: item.isActive } });
        }
      });
      return 'update product category status success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }
}
