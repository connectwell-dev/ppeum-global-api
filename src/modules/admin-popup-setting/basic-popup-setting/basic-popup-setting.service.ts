import { Injectable } from '@nestjs/common';
import { CustomException } from '@src/common/exceptions';
import { formatLocalYmdHms } from '@src/common/utils/date-format';
import { PrismaService } from '@src/core/prisma/prisma.service';

@Injectable()
export class BasicPopupSettingService {

  constructor(private readonly prisma: PrismaService) { }

  async getBasicPopupList() {
    try {
      return await this.prisma.popupBasic.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          language: true
          // type: true
        },
        orderBy: { language: 'asc' }
      });
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  async getBasicPopupDetail(popupBasicId: number) {
    try {
      const basicPopup = await this.prisma.popupBasic.findFirst({
        where: { id: popupBasicId, deletedAt: null },
        select: {
          id: true,
          language: true,
          startAt: true,
          startTime: true,
          endAt: true,
          endTime: true,
          images: {
            select: {
              path: true
            }
          }
        }
      });

      if (!basicPopup) {
        throw new CustomException('basic-popup.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'basic-popup.not_found' });
      }

      const basicPopupCreatedDates = await this.prisma.popupBasic.findMany({
        where: { language: basicPopup.language, deletedAt: null, /** type: basicPopup.type */ },
        select: {
          id: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      const mapData = basicPopupCreatedDates.map((item) => {
        const { createdAt, ...rest } = item;
        return { ...rest, createdAt: formatLocalYmdHms(createdAt) }
      })
      return { ...basicPopup, createdDates: mapData };

    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }
}
