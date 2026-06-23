import { Injectable } from '@nestjs/common';
import { CustomException } from '@src/common/exceptions';
import { formatLocalYmdHms } from '@src/common/utils/date-format';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { PutPolicyReqDto } from './dto/put-policy/request.dto';

@Injectable()
export class AdminPolicySettingService {
  constructor(private readonly prisma: PrismaService) { }

  private async findPolicyOrThrow(policyId: number) {
    const policy = await this.prisma.policy.findFirst({
      where: { id: policyId, deletedAt: null },
    });
    if (!policy) {
      throw new CustomException('policy.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'policy.not_found' });
    }
    return policy;
  }

  async getPoliicyList() {
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

  async getPoliicyDetail(policyId: number) {
    try {
      const policy = await this.findPolicyOrThrow(policyId);

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

  async putPolicy(policyId: number, dto: PutPolicyReqDto) {
    try {
      await this.findPolicyOrThrow(policyId);
      await this.prisma.policy.update({ where: { id: policyId }, data: { note: dto.note } });
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }
}
