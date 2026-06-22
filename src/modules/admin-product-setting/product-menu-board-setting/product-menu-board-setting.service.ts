import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { CustomException } from '@common/exceptions';
import { PatchMenuBoardStatusReqDto } from './dto/patch-menu-board/request.dto';
import { Language } from '@prisma/client';
import { GetMenuBoardProductListResDto } from './dto/get-menu-board-product/response.dto';
import { SettingService } from '@src/core/setting/setting.service';
import { pickTranslation } from '@common/utils/translation-utils';

@Injectable()
export class ProductMenuBoardSettingService {
  constructor(private readonly prisma: PrismaService, private readonly settingService: SettingService) { }

  async getMenuBoardProductList(productCategoryId: number, headerLang: Language): Promise<GetMenuBoardProductListResDto[]> {
    try {
      const categoryCheck = await this.prisma.productCategory.findUnique({ where: { id: productCategoryId }, include: { productCategoryTranslations: { select: { language: true, name: true } } } });
      if (!categoryCheck) throw new CustomException('common.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'common.not_found' });

      const defaultLang = this.settingService.getDefaultLanguage() as Language;

      const items = await this.prisma.productToProductCategory.findMany({
        where: { productCategoryId },
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
                  parent: {
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
          },
        },
        orderBy: { order: 'asc' },
      });

      return items.map((item) => {
        const productName = pickTranslation(item.product?.productTranslations ?? [], 'name', headerLang, defaultLang) ?? '';
        const subCategoryName = pickTranslation(item.product?.productCategory?.productCategoryTranslations ?? [], 'name', headerLang, defaultLang)
        const mainCategoryName = pickTranslation(item.product?.productCategory?.parent?.productCategoryTranslations ?? [], 'name', headerLang, defaultLang)

        return {
          id: item.productId,
          code: item.product?.code ?? '',
          name: productName,
          mainCategoryName: mainCategoryName,
          subCategoryName: subCategoryName,
          order: item.order,
        }
      });
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  async patchMenuBoardStatus(dto: PatchMenuBoardStatusReqDto): Promise<string> {
    try {
      await this.prisma.$transaction(async (tx) => {
        for (const item of dto.items) {
          await tx.productToProductCategory.update({
            where: { productId_productCategoryId: { productId: item.productId, productCategoryId: dto.productCategoryId } },
            data: { order: item.order },
          });
        }
      });
      return 'update menu board status success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }
}
