import { Injectable } from '@nestjs/common';
import { Language } from '@prisma/client';
import { CustomException } from '@src/common/exceptions';
import { formatLocalYmdHms } from '@src/common/utils/date-format';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { create } from 'domain';

@Injectable()
export class AdminPolicySettingService {
  constructor(private readonly prisma: PrismaService) { }

  async getPoilicyList() {
    try {
      const [total, policy] = await Promise.all([
        this.prisma.policy.count({ where: { deletedAt: null } }),
        this.prisma.policy.findMany({
          where: { deletedAt: null },
          select: {
            id: true,
            language: true,
            type: true
          },
          orderBy: { language: 'asc' }
        }),
      ]);
      return { total, policy };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  async getPoilicyDetail(policyId: number) {
    try {

      const policy = await this.prisma.policy.findFirst({
        where: { id: policyId, deletedAt: null },
        select: {
          id: true,
          language: true,
          type: true,
          note: true
        }
      });

      if (!policy) {
        throw new CustomException('policy.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'policy.not_found' });
      }

      const policyCreatedDates = await this.prisma.policy.findMany({
        where: { language: policy.language, type: policy.type, deletedAt: null },
        select: {
          id: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      const mapData = policyCreatedDates.map((item) => {
        const { createdAt, ...rest } = item;
        return { ...rest, createdAt: formatLocalYmdHms(createdAt) }
      })
      return { ...policy, createdDates: mapData };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }
}
