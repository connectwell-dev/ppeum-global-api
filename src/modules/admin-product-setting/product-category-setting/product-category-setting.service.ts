import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { CustomException } from '@common/exceptions';
import { OrderHelper } from '@src/core/helpers/order.helper';
import { PatchProductCategoryItemDto, PatchProductCategoryStatusReqDto } from './dto/patch-product-category/request.dto';
import { CommonSetResponseDto } from '@common/dto/common-response.dto';
import { GetProductCategoryProductListResDto } from './dto/get-product-category-product/response.dto';
import { SetProductCategoryMainReqDto, SetProductCategorySubReqDto } from './dto/set-product-category/request.dto';
import { SettingService } from '@src/core/setting/setting.service';
import { Language } from '@prisma/client';
import { pickTranslation } from '@common/utils/translation-utils';
import {
  GetProductCategoryMainListResDto,
  GetProductCategorySubListResDto,
} from './dto/get-product-category/response.dto';

@Injectable()
export class ProductCategorySettingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderHelper: OrderHelper,
    private readonly settingService: SettingService,
  ) { }

  // ────────── 공통 헬퍼 ──────────

  private async duplicateNameCheck(translations: { language: string; name: string }[], depth: number, excludeId?: number): Promise<void> {
    for (const t of translations) {
      const existing = await this.prisma.productCategoryTranslation.findFirst({
        where: {
          language: t.language as any,
          name: t.name,
          productCategory: { depth, deletedAt: null },
          ...(excludeId ? { productCategoryId: { not: excludeId } } : {}),
        },
      });
      if (existing) {
        throw new CustomException('product.category.name.duplicate', 'BAD_REQUEST', { field: `name.${t.language}`, fieldMessage: 'product.category.name.duplicate', });
      }
    }
  }

  // ────────── 대분류 ──────────

  async getProductCategoryMainList(headerLang: Language): Promise<GetProductCategoryMainListResDto[]> {
    try {
      const list = await this.prisma.productCategory.findMany({
        where: { depth: 0, deletedAt: null },
        include: { productCategoryTranslations: { select: { language: true, name: true } } },
        orderBy: { order: 'asc' },
      });

      return list.map(({ productCategoryTranslations, ...rest }) => ({
        ...rest,
        name: pickTranslation(productCategoryTranslations ?? [], 'name', headerLang, this.settingService.getDefaultLanguage() as Language) ?? '',
      })) as any;
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async getProductCategoryMainDetail(id: number): Promise<GetProductCategoryMainListResDto> {
    try {
      const category = await this.prisma.productCategory.findFirst({
        where: { id, depth: 0, deletedAt: null },
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

  async setProductCategoryMain(dto: SetProductCategoryMainReqDto): Promise<CommonSetResponseDto> {
    try {
      // 기준언어 여부 확인
      if (!dto.translations.find(t => t.language === this.settingService.getDefaultLanguage())) throw new CustomException('product.category.name.required', 'BAD_REQUEST', { field: `name.${this.settingService.getDefaultLanguage()}`, fieldMessage: 'product.category.name.required' });
      await this.duplicateNameCheck(dto.translations, 0);

      const created = await this.prisma.$transaction(async (tx) => {
        const order = await this.orderHelper.getNextOrder('productCategory', { depth: 0, deletedAt: null }, tx);
        const category = await tx.productCategory.create({
          data: { depth: 0, order, isActive: dto.isActive },
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

  async putProductCategoryMain(id: number, dto: SetProductCategoryMainReqDto): Promise<string> {
    try {
      const category = await this.prisma.productCategory.findFirst({ where: { id, depth: 0, deletedAt: null } });
      if (!category) throw new CustomException('common.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'common.not_found' });
      if (!dto.translations.find(t => t.language === this.settingService.getDefaultLanguage())) throw new CustomException('product.category.name.required', 'BAD_REQUEST', { field: `name.${this.settingService.getDefaultLanguage()}`, fieldMessage: 'product.category.name.required' });
      await this.duplicateNameCheck(dto.translations, 0, id);

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

      return 'update product category main success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async deleteProductCategoryMain(id: number): Promise<string> {
    try {
      const category = await this.prisma.productCategory.findFirst({
        where: { id, depth: 0, deletedAt: null },
        include: { children: { where: { deletedAt: null } } },
      });

      if (!category) throw new CustomException('common.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'common.not_found' });
      if (category.children.length > 0) throw new CustomException('common.not_deleted_condition', 'NOT_DELETED_CONDITION');
      await this.prisma.$transaction(async (tx) => {
        await tx.productCategory.update({ where: { id }, data: { deletedAt: new Date(), order: 0 } });
        await this.orderHelper.reorderAfterDelete('productCategory', category.order, { depth: 0, deletedAt: null, }, tx);
      });

      return 'delete product category main success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  // ────────── 중분류 ──────────

  async getProductCategorySubList(parentId: number, headerLang: Language): Promise<GetProductCategorySubListResDto[]> {
    try {
      const parent = await this.prisma.productCategory.findFirst({ where: { id: parentId, depth: 0, deletedAt: null } });
      if (!parent) throw new CustomException('common.not_found', 'BAD_REQUEST', { field: 'parentId', fieldMessage: 'common.not_found' });

      const list = await this.prisma.productCategory.findMany({
        where: { depth: 1, parentId, deletedAt: null },
        include: { productCategoryTranslations: { select: { language: true, name: true } } },
        orderBy: { order: 'asc' },
      });

      return list.map(({ productCategoryTranslations, ...rest }) => ({
        ...rest,
        name: pickTranslation(productCategoryTranslations ?? [], 'name', headerLang, this.settingService.getDefaultLanguage() as Language) ?? '',
      })) as any;
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async getProductCategorySubDetail(id: number): Promise<GetProductCategorySubListResDto> {
    try {
      const category = await this.prisma.productCategory.findFirst({
        where: { id, depth: 1, deletedAt: null },
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
        where: { id, depth: 1, deletedAt: null },
        include: {
          productCategoryTranslations: { select: { language: true, name: true } },
          parent: { include: { productCategoryTranslations: { select: { language: true, name: true } } } },
        },
      });
      if (!category) throw new CustomException('common.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'common.not_found' });


      const defaultLang = this.settingService.getDefaultLanguage() as Language;
      const subCategoryName = pickTranslation(category.productCategoryTranslations ?? [], 'name', headerLang, defaultLang)
      const mainCategoryName = pickTranslation(category.parent?.productCategoryTranslations ?? [], 'name', headerLang, defaultLang)


      const products = await this.prisma.product.findMany({
        where: { productCategoryId: id, deletedAt: null },
        include: { productTranslations: { select: { language: true, name: true } } },
      });

      return products.map(({ productTranslations, ...rest }) => {
        const name = pickTranslation(productTranslations ?? [], 'name', headerLang, defaultLang)
        return { id: rest.id, code: rest.code, mainCategoryName, subCategoryName, name };
      }) as GetProductCategoryProductListResDto[];
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async setProductCategorySub(dto: SetProductCategorySubReqDto): Promise<CommonSetResponseDto> {
    try {
      const parent = await this.prisma.productCategory.findFirst({
        where: { id: dto.parentId, depth: 0, deletedAt: null },
      });
      if (!parent) throw new CustomException('product.category-main.not_found', 'BAD_REQUEST', { field: 'parentId', fieldMessage: 'product.category-main.not_found' });
      if (!dto.translations.find(t => t.language === this.settingService.getDefaultLanguage())) throw new CustomException('product.category.name.required', 'BAD_REQUEST', { field: `name.${this.settingService.getDefaultLanguage()}`, fieldMessage: 'product.category.name.required' });
      await this.duplicateNameCheck(dto.translations, 1);

      const created = await this.prisma.$transaction(async (tx) => {
        const order = await this.orderHelper.getNextOrder(
          'productCategory',
          { depth: 1, parentId: dto.parentId, deletedAt: null },
          tx,
        );
        const category = await tx.productCategory.create({
          data: { depth: 1, parentId: dto.parentId, order, isActive: dto.isActive },
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

  async putProductCategorySub(id: number, dto: SetProductCategorySubReqDto): Promise<string> {
    try {
      const category = await this.prisma.productCategory.findFirst({ where: { id, depth: 1, deletedAt: null } });
      if (!category) throw new CustomException('common.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'common.not_found' });
      const parent = await this.prisma.productCategory.findFirst({ where: { id: dto.parentId, depth: 0, deletedAt: null } });
      if (!parent) throw new CustomException('common.not_found', 'BAD_REQUEST', { field: 'parentId', fieldMessage: 'common.not_found' });
      if (!dto.translations.find(t => t.language === this.settingService.getDefaultLanguage())) throw new CustomException('product.category.name.required', 'BAD_REQUEST', { field: `name.${this.settingService.getDefaultLanguage()}`, fieldMessage: 'product.category.name.required' });

      await this.duplicateNameCheck(dto.translations, 1, id);

      await this.prisma.$transaction(async (tx) => {
        await tx.productCategory.update({
          where: { id },
          data: { isActive: dto.isActive, parentId: dto.parentId },
        });
        for (const t of dto.translations) {
          await tx.productCategoryTranslation.upsert({
            where: { productCategoryId_language: { productCategoryId: id, language: t.language as any } },
            update: { name: t.name },
            create: { productCategoryId: id, language: t.language as any, name: t.name },
          });
        }
      });

      return 'update product category sub success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async deleteProductCategorySub(id: number): Promise<string> {
    try {
      const category = await this.prisma.productCategory.findFirst({ where: { id, depth: 1, deletedAt: null } });
      if (!category) throw new CustomException('common.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'common.not_found' });

      const productCheck = await this.prisma.product.findFirst({ where: { productCategoryId: id, deletedAt: null } });
      const menuBoardProductCheck = await this.prisma.productToProductCategory.findFirst({ where: { productCategoryId: id } });
      if (productCheck || menuBoardProductCheck) throw new CustomException('common.not_deleted_condition', 'NOT_DELETED_CONDITION');

      await this.prisma.$transaction(async (tx) => {
        await tx.productCategory.update({ where: { id }, data: { deletedAt: new Date(), order: 0 } });
        await this.orderHelper.reorderAfterDelete('productCategory', category.order, { depth: 1, parentId: category.parentId, deletedAt: null, }, tx);
      });
      // 순서 조정
      return 'delete product category sub success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  // ────────── 순서/사용여부 일괄 ──────────

  async patchProductCategoryStatus(dto: PatchProductCategoryStatusReqDto): Promise<string> {
    try {
      await this.prisma.$transaction(async (tx) => {
        for (const item of dto.mainItems) {
          await tx.productCategory.update({ where: { id: item.id }, data: { order: item.order, isActive: item.isActive } });
        }
        for (const item of dto.subItems) {
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
