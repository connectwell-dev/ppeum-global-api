import { Injectable } from '@nestjs/common';
import { CustomException } from '@src/common/exceptions';
import { formatLocalYmdHms } from '@src/common/utils/date-format';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { S3Service } from '@src/core/s3/s3.service';
import { PutBasicPopupReqDto } from './dto/put-basic-popup/request.dto';

@Injectable()
export class BasicPopupSettingService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) { }

  private async findBasicPopupCategoryOrThrow(categoryId: number) {
    const category = await this.prisma.popupBasicCategory.findFirst({
      where: { id: categoryId, deletedAt: null },
    });
    if (!category) {
      throw new CustomException('basic-popup.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'basic-popup.not_found' });
    }
    return category;
  }

  private async findBasicPopupOrThrow(popupBasicId: number) {
    const popup = await this.prisma.popupBasic.findFirst({
      where: { id: popupBasicId, deletedAt: null },
    });
    if (!popup) {
      throw new CustomException('basic-popup.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'basic-popup.not_found' });
    }
    return popup;
  }

  async getBasicPopupCategoryList() {
    try {
      const [total, popupBasicCategory] = await Promise.all([
        this.prisma.popupBasicCategory.count({ where: { deletedAt: null } }),
        this.prisma.popupBasicCategory.findMany({
          where: { deletedAt: null },
          select: {
            id: true,
            language: true,
            type: true
          },
          orderBy: { id: 'asc' }
        })
      ]);
      return { total, popupBasicCategory };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  async getBasicPopupCategoryDetail(categoryId: number) {
    try {
      const category = await this.findBasicPopupCategoryOrThrow(categoryId);

      const popupBasics = await this.prisma.popupBasic.findMany({
        where: { popupBasicCategoryId: categoryId, deletedAt: null },
        select: {
          id: true,
          startAt: true,
          startTime: true,
          endAt: true,
          endTime: true,
          createdAt: true,
          images: {
            select: {
              path: true
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const mapData = popupBasics.map((item) => {
        const { createdAt, ...rest } = item;
        return { ...rest, createdAt: formatLocalYmdHms(createdAt) };
      });

      return { ...category, popupBasics: mapData };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  async setBasicPopupImage(popupBasicId: number, file: Express.Multer.File) {
    try {
      await this.findBasicPopupOrThrow(popupBasicId);

      const s3Key = await this.s3Service.upload(file, 'popup-basic');
      await this.prisma.popupBasicImage.create({
        data: { popupBasicId, path: s3Key },
      });
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  async putBasicPopup(popupBasicId: number, dto: PutBasicPopupReqDto, file?: Express.Multer.File) {
    try {
      await this.findBasicPopupOrThrow(popupBasicId);

      await this.prisma.popupBasic.update({
        where: { id: popupBasicId },
        data: {
          startAt: dto.startAt,
          startTime: dto.startTime,
          endAt: dto.endAt,
          endTime: dto.endTime,
        },
      });

      if (file) {
        const oldImages = await this.prisma.popupBasicImage.findMany({
          where: { popupBasicId },
        });
        for (const img of oldImages) {
          await this.s3Service.delete(img.path);
        }
        await this.prisma.popupBasicImage.deleteMany({ where: { popupBasicId } });

        const s3Key = await this.s3Service.upload(file, 'popup-basic');
        await this.prisma.popupBasicImage.create({
          data: { popupBasicId, path: s3Key },
        });
      }
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }
}
