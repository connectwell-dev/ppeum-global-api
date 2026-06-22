import { Injectable } from '@nestjs/common';
import { CustomException } from '@common/exceptions';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { SetImageCategoryReqDto } from './dto/set-image-category/request.dto';
import { PutImageCategoryReqDto } from './dto/put-image-category/request.dto';

@Injectable()
export class ImageCategorySettingService {
  constructor(private readonly prisma: PrismaService) { }

  private async duplicateNameCheck(name: string, id?: number) {
    const dup = await this.prisma.generalImageCategory.findFirst({ where: { name, deletedAt: null, id: { not: id } } });
    if (dup) throw new CustomException('general.duplicate.imageCategory.name', 'BAD_REQUEST', { field: 'name', fieldMessage: 'general.duplicate.imageCategory.name' });
  }

  async getImageCategoryList() {
    try {
      return await this.prisma.generalImageCategory.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, type: true },
        orderBy: { createdAt: 'asc' },
      });
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async getImageCategoryDetail(id: number) {
    try {
      const category = await this.prisma.generalImageCategory.findUnique({
        where: { id, deletedAt: null },
        select: { id: true, name: true, type: true, createdAt: true, updatedAt: true },
      });
      if (!category) throw new CustomException('general.not_found.imageCategory.id', 'BAD_REQUEST', { field: 'id', fieldMessage: 'general.not_found.imageCategory.id' });
      return category;
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async setImageCategory(dto: SetImageCategoryReqDto) {
    try {
      await this.duplicateNameCheck(dto.name);
      await this.prisma.generalImageCategory.create({ data: { name: dto.name, type: dto.type ?? null } });
      return 'set image category success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async putImageCategory(id: number, dto: PutImageCategoryReqDto) {
    try {
      const category = await this.prisma.generalImageCategory.findUnique({ where: { id, deletedAt: null } });
      if (!category) throw new CustomException('general.not_found.imageCategory.id', 'BAD_REQUEST', { field: 'id', fieldMessage: 'general.not_found.imageCategory.id' });
      await this.duplicateNameCheck(dto.name, id);
      await this.prisma.generalImageCategory.update({ where: { id }, data: { name: dto.name, type: dto.type ?? null } });
      return 'update image category success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async deleteImageCategory(id: number) {
    try {
      const category = await this.prisma.generalImageCategory.findUnique({ where: { id, deletedAt: null } });
      if (!category) throw new CustomException('general.not_found.imageCategory.id', 'BAD_REQUEST', { field: 'id', fieldMessage: 'general.not_found.imageCategory.id' });

      const hasImages = await this.prisma.generalImage.findFirst({ where: { imageCategoryId: id, deletedAt: null } });
      if (hasImages) throw new CustomException('general.hasImages.imageCategory', 'NOT_DELETED_CONDITION');

      await this.prisma.generalImageCategory.update({ where: { id }, data: { deletedAt: new Date() } });
      return 'delete image category success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }
}
