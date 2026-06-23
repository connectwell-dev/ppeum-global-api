import { Injectable } from '@nestjs/common';
import { CustomException } from '@src/common/exceptions';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { SetHospitalClosedDateReqDto } from './dto/set-hospital-closed-date/request.dto';

@Injectable()
export class HospitalClosedDateSettingService {

  constructor(private readonly prisma: PrismaService) { }

  async getClosedDateList(year: number, month: number) {
    try {
      const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
      const endOfMonth = `${year}-${String(month).padStart(2, '0')}-31`;

      const list = await this.prisma.hospitalDateClosedTime.findMany({
        where: {
          deletedAt: null,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        select: {
          id: true,
          date: true,
        },
        orderBy: { date: 'asc' },
      });

      return list;
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async getClosedDateDetail(date: string) {
    try {
      const row = await this.prisma.hospitalDateClosedTime.findFirst({
        where: { deletedAt: null, date },
      });

      if (!row) return { date, closedTime: null };

      return {
        id: row.id,
        date,
        closedTime: row.closedTime as Record<string, boolean>,
      };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async setClosedDate(dto: SetHospitalClosedDateReqDto) {
    try {
      const { date, closedTime } = dto;

      const hasAnyClosed = Object.values(closedTime).some((v) => v === true);

      const existing = await this.prisma.hospitalDateClosedTime.findFirst({
        where: { date, deletedAt: null },
      });

      if (existing) {
        if (!hasAnyClosed) {
          await this.prisma.hospitalDateClosedTime.update({
            where: { id: existing.id },
            data: { deletedAt: new Date() },
          });
          return 'closed date removed';
        }
        await this.prisma.hospitalDateClosedTime.update({
          where: { id: existing.id },
          data: { closedTime: closedTime as object },
        });
        return 'closed date updated';
      }

      if (!hasAnyClosed) return 'no closed time to register';

      await this.prisma.hospitalDateClosedTime.create({
        data: {
          date,
          closedTime: closedTime as object,
        },
      });

      return 'closed date created';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }
}
