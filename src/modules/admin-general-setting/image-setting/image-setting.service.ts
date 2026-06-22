import { Injectable } from '@nestjs/common';
import { CustomException } from '@common/exceptions';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { S3Service } from '@src/core/s3/s3.service';
import { PaginatedResponseDto } from '@common/dto/pagination.dto';
import { GetImageListQueryDto } from './dto/get-image/query.dto';
import { GetImageListResDto } from './dto/get-image/response.dto';
import { SetImageReqDto } from './dto/set-image/request.dto';
import { PutImageReqDto } from './dto/put-image/request.dto';

@Injectable()
export class ImageSettingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) { }

  private async duplicateNameCheck(name: string, code?: string) {
    const dup = await this.prisma.generalImage.findFirst({ where: { name, deletedAt: null, code: { not: code } } });
    if (dup) throw new CustomException('general.duplicate.image.name', 'BAD_REQUEST', { field: 'name', fieldMessage: 'general.duplicate.image.name' });
  }

  private async checkCategory(imageCategoryId: number) {
    const category = await this.prisma.generalImageCategory.findUnique({ where: { id: imageCategoryId, deletedAt: null } });
    if (!category) throw new CustomException('general.not_found.imageCategory.id', 'BAD_REQUEST', { field: 'imageCategoryId', fieldMessage: 'general.not_found.imageCategory.id' });
  }


  async getImageList(query: GetImageListQueryDto): Promise<PaginatedResponseDto<GetImageListResDto>> {
    try {
      const where: any = { deletedAt: null };
      if (query.categoryId) where.imageCategoryId = query.categoryId;
      if (query.code) where.code = query.code;
      if (query.name) where.name = { contains: query.name };
      if (query.type) where.imageCategory = { type: query.type };

      const [total, images] = await Promise.all([
        this.prisma.generalImage.count({ where }),
        this.prisma.generalImage.findMany({
          where,
          select: { code: true, name: true, path: true, createdAt: true, updatedAt: true },
          orderBy: { createdAt: 'desc' },
          skip: (query.page - 1) * query.rowCount,
          take: query.rowCount,
        }),
      ]);

      const data = images.map((image) => {
        const data = { ...image };
        return data;
      });

      return { total, page: query.page, totalPage: Math.ceil(total / query.rowCount), data };
    } catch (error) {
      console.error('[getImageList error]', error);
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async getImageDetail(code: string) {
    try {
      const image = await this.prisma.generalImage.findUnique({
        where: { code, deletedAt: null },
        select: {
          code: true,
          name: true,
          path: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!image) throw new CustomException('general.not_found.image.code', 'BAD_REQUEST', { field: 'code', fieldMessage: 'general.not_found.image.code' });
      return image;
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async setImage(file: Express.Multer.File, dto: SetImageReqDto) {
    try {
      await this.checkCategory(dto.imageCategoryId);
      await this.duplicateNameCheck(dto.name);

      const s3Key = await this.s3Service.upload(file, 'general');
      const image = await this.prisma.generalImage.create({
        data: { name: dto.name, path: s3Key, imageCategoryId: dto.imageCategoryId },
      });
      return { code: image.code };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      console.error('[setImage error]', error);
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async putImage(code: string, file: Express.Multer.File | undefined, dto: PutImageReqDto) {
    try {
      const image = await this.prisma.generalImage.findUnique({ where: { code, deletedAt: null } });
      if (!image) throw new CustomException('general.not_found.image.code', 'BAD_REQUEST', { field: 'code', fieldMessage: 'general.not_found.image.code' });

      await this.checkCategory(dto.imageCategoryId);
      await this.duplicateNameCheck(dto.name, image.code);

      let newPath = image.path;
      if (file) {
        newPath = await this.s3Service.upload(file, 'general');
        await this.s3Service.delete(image.path);
      }

      await this.prisma.generalImage.update({
        where: { code },
        data: { name: dto.name, path: newPath, imageCategoryId: dto.imageCategoryId },
      });
      return 'update image success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async deleteImage(code: string) {
    try {
      const image = await this.prisma.generalImage.findUnique({ where: { code, deletedAt: null } });
      if (!image) throw new CustomException('general.not_found.image.code', 'BAD_REQUEST', { field: 'code', fieldMessage: 'general.not_found.image.code' });

      await this.prisma.generalImage.update({ where: { code }, data: { deletedAt: new Date() } });
      return 'delete image success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }
}
