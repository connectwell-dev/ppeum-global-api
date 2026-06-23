import { Injectable } from '@nestjs/common';
import { CustomException } from '@src/common/exceptions';
import { formatLocalYmdHms } from '@src/common/utils/date-format';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { S3Service } from '@src/core/s3/s3.service';
import { PutMainPopupReqDto } from './dto/put-main-popup/request.dto';

@Injectable()
export class MainPopupSettingService {
  constructor(private readonly prisma: PrismaService, private readonly s3Service: S3Service) { }

  private async findMainPopupCategoryOrThrow(categoryId: number) {
    const category = await this.prisma.popupMainCategory.findFirst({
      where: { id: categoryId, deletedAt: null },
    });
    if (!category) {
      throw new CustomException('main-popup.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'main-popup.not_found' });
    }
    return category;
  }

  private async findMainPopupOrThrow(popupMainId: number) {
    const popup = await this.prisma.popupMain.findFirst({
      where: { id: popupMainId, deletedAt: null },
    });
    if (!popup) {
      throw new CustomException('main-popup.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'main-popup.not_found' });
    }
    return popup;
  }

  async getMainPopupCategoryList() {
    try {
      const [total, popupMainCategory] = await Promise.all([
        this.prisma.popupMainCategory.count({ where: { deletedAt: null } }),
        this.prisma.popupMainCategory.findMany({
          where: { deletedAt: null },
          select: {
            id: true,
            language: true,
            type: true
          },
          orderBy: { id: 'asc' }
        })
      ]);
      return { total, popupMainCategory };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  async getMainPopupCategoryDetail(categoryId: number) {
    try {
      const category = await this.findMainPopupCategoryOrThrow(categoryId);

      const popupMains = await this.prisma.popupMain.findMany({
        where: { popupMainCategoryId: categoryId, deletedAt: null },
        select: {
          id: true,
          title: true,
          link: true,
          startAt: true,
          startTime: true,
          endAt: true,
          endTime: true,
          isNewTab: true,
          createdAt: true,
          order: true,
          images: {
            select: { path: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { order: 'asc' },
      });

      const mapData = popupMains.map((p) => ({
        ...p,
        createdAt: formatLocalYmdHms(p.createdAt),
      }));

      return { ...category, popupMains: mapData };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  async setMainPopupImage(popupMainId: number, file: Express.Multer.File) {
    try {
      await this.findMainPopupOrThrow(popupMainId);

      const oldImages = await this.prisma.popupMainImage.findMany({
        where: { popupMainId },
      });
      for (const img of oldImages) {
        await this.s3Service.delete(img.path);
      }
      await this.prisma.popupMainImage.deleteMany({ where: { popupMainId } });

      const s3Key = await this.s3Service.upload(file, 'popup-main');
      await this.prisma.popupMainImage.create({
        data: { popupMainId, path: s3Key },
      });
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  async reorderMainPopup(items: { id: number; order: number }[]) {
    try {
      await this.prisma.$transaction(
        items.map((item) =>
          this.prisma.popupMain.update({
            where: { id: item.id },
            data: { order: item.order },
          }),
        ),
      );
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  async putMainPopup(popupMainId: number, dto: PutMainPopupReqDto, file?: Express.Multer.File) {
    try {
      await this.findMainPopupOrThrow(popupMainId);

      await this.prisma.popupMain.update({
        where: { id: popupMainId },
        data: {
          startAt: dto.startAt,
          startTime: dto.startTime,
          endAt: dto.endAt,
          endTime: dto.endTime,
          title: dto.title,
          link: dto.link || null,
          isNewTab: dto.isNewTab === 'true',
          ...(dto.order ? { order: Number(dto.order) } : {}),
        },
      });

      if (file) {
        const oldImages = await this.prisma.popupMainImage.findMany({
          where: { popupMainId },
        });
        for (const img of oldImages) {
          await this.s3Service.delete(img.path);
        }
        await this.prisma.popupMainImage.deleteMany({ where: { popupMainId } });

        const s3Key = await this.s3Service.upload(file, 'popup-main');
        await this.prisma.popupMainImage.create({
          data: { popupMainId, path: s3Key },
        });
      }
    } catch (error) {
      console.log(error);
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }
}
