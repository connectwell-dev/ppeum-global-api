import { Injectable } from '@nestjs/common';
import { WeekDayType } from '@prisma/client';
import { CustomException } from '@src/common/exceptions';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { SetHospitalWeeklyWorkTimeReqDto } from './dto/set-hospital-reservation/request.dto';

@Injectable()
export class HospitalReservationSettingService {

  constructor(private readonly prisma: PrismaService) { }

  async getHospitalWeeklyWorkTime() {
    try {
      const list = await this.prisma.hospitalWeeklyWorkTime.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          weekDayType: true,
          weeklyTime: true,
          lunchTime: true,
          isTreatment: true,
        },
      });

      type TimeRange = { startTime: string; endTime: string };
      type DayData = {
        id: number | null;
        isTreatment: boolean;
        weeklyTime: TimeRange | null;
        lunchTime: TimeRange | null;
      };

      const dayOrder = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

      const grouped = dayOrder.reduce((acc, day) => {
        const row = list.find((item) => item.weekDayType === day);
        acc[day] = {
          id: row?.id ?? null,
          isTreatment: row?.isTreatment ?? true,
          weeklyTime: (row?.weeklyTime as TimeRange | null) ?? null,
          lunchTime: (row?.lunchTime as TimeRange | null) ?? null,
        } satisfies DayData;
        return acc;
      }, {} as Record<(typeof dayOrder)[number], DayData>);

      return grouped;
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }

  async setHospitalWeeklyWorkTime(dto: SetHospitalWeeklyWorkTimeReqDto) {
    try {
      await this.prisma.$transaction(async (tx) => {
        for (const item of dto.data) {
          if (item.weeklyTime && item.weeklyTime.startTime >= item.weeklyTime.endTime) {
            throw new CustomException('hospitalWeeklyWorkTime.startTimeMustBeBeforeEndTime', 'BAD_REQUEST', {
              field: 'weeklyTime.endTime',
              fieldMessage: 'hospitalWeeklyWorkTime.startTimeMustBeBeforeEndTime',
            });
          }

          if (item.lunchTime && item.lunchTime.startTime >= item.lunchTime.endTime) {
            throw new CustomException('hospitalWeeklyWorkTime.lunchStartTimeMustBeBeforeEndTime', 'BAD_REQUEST', {
              field: 'lunchTime.endTime',
              fieldMessage: 'hospitalWeeklyWorkTime.lunchStartTimeMustBeBeforeEndTime',
            });
          }

          const existing = await tx.hospitalWeeklyWorkTime.findFirst({
            where: { weekDayType: item.weekDayType as WeekDayType, deletedAt: null },
          });

          const data = {
            weeklyTime: item.weeklyTime ? (item.weeklyTime as object) : null,
            lunchTime: item.lunchTime ? (item.lunchTime as object) : null,
            isTreatment: item.isTreatment,
          };

          if (existing) {
            await tx.hospitalWeeklyWorkTime.update({
              where: { id: existing.id },
              data,
            });
          } else {
            await tx.hospitalWeeklyWorkTime.create({
              data: {
                weekDayType: item.weekDayType as WeekDayType,
                ...data,
              },
            });
          }
        }
      });

      return 'set hospital weekly work time success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException('common.errorMessage', 'INTERNAL_SERVER_ERROR');
    }
  }
}
