import { Injectable } from '@nestjs/common';
import { Language } from '@prisma/client';
import { CustomException } from '@src/common/exceptions';
import { PrismaService } from '@src/core/prisma/prisma.service';

@Injectable()
export class AdminPolicySettingService {
  constructor(private readonly prisma: PrismaService) { }

  async getPoilicyList() {
    try {
      return await this.prisma.policy.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          language: true,
          type: true
        },
        orderBy: { language: 'asc' }
      });
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
        where: { language: policy.language, deletedAt: null },
        select: {
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return { ...policy, createdDates: policyCreatedDates };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }
}
