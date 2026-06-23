import { Injectable } from '@nestjs/common';
import { CustomException } from '@src/common/exceptions';
import { formatLocalYmdHms } from '@src/common/utils/date-format';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { PutPolicyReqDto } from './dto/put-policy/request.dto';

@Injectable()
export class AdminPolicySettingService {
  constructor(private readonly prisma: PrismaService) { }

  private async findPolicyCategoryOrThrow(categoryId: number) {
    const category = await this.prisma.policyCategory.findFirst({
      where: { id: categoryId, deletedAt: null },
    });
    if (!category) {
      throw new CustomException('policy.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'policy.not_found' });
    }
    return category;
  }

  private async findPolicyOrThrow(policyId: number) {
    const policy = await this.prisma.policy.findFirst({
      where: { id: policyId, deletedAt: null },
    });
    if (!policy) {
      throw new CustomException('policy.not_found', 'BAD_REQUEST', { field: 'id', fieldMessage: 'policy.not_found' });
    }
    return policy;
  }

  async getPolicyCategoryList() {
    try {
      const [total, policyCategory] = await Promise.all([
        this.prisma.policyCategory.count({ where: { deletedAt: null } }),
        this.prisma.policyCategory.findMany({
          where: { deletedAt: null },
          select: {
            id: true,
            language: true,
            type: true
          },
          orderBy: { id: 'asc' }
        }),
      ]);
      return { total, policyCategory };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  async getPolicyCategoryDetail(categoryId: number) {
    try {
      const category = await this.findPolicyCategoryOrThrow(categoryId);

      const policies = await this.prisma.policy.findMany({
        where: { policyCategoryId: categoryId, deletedAt: null },
        select: {
          id: true,
          note: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      const mapData = policies.map((item) => {
        const { createdAt, ...rest } = item;
        return { ...rest, createdAt: formatLocalYmdHms(createdAt) };
      });

      return { ...category, policies: mapData };
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
