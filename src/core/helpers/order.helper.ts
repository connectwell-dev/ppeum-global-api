import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * 순서 변경 공통 헬퍼
 */
@Injectable()
export class OrderHelper {
  constructor(private readonly prisma: PrismaService) { }

  async updateOrder(
    modelName: keyof typeof this.prisma,
    id: number | string,
    newOrder: number,
    additionalWhere: Record<string, any>,
    useTransaction: boolean = true,
  ): Promise<boolean> {
    const model = this.prisma[modelName as keyof typeof this.prisma] as any;

    if (!model) {
      throw new Error(`Invalid model name: ${String(modelName)}`);
    }

    const currentItem = await model.findFirst({
      where: {
        id,
        ...additionalWhere,
      },
      select: {
        order: true,
      },
    });

    if (!currentItem) {
      return false;
    }

    const oldOrder = currentItem.order;

    if (oldOrder === newOrder) {
      return true;
    }

    const updateOrderLogic = async (tx: any) => {
      if (newOrder < oldOrder) {
        await tx[modelName].updateMany({
          where: {
            order: { gte: newOrder, lt: oldOrder },
            id: { not: id },
            ...additionalWhere,
          },
          data: { order: { increment: 1 } },
        });
      } else {
        await tx[modelName].updateMany({
          where: {
            order: { gt: oldOrder, lte: newOrder },
            id: { not: id },
            ...additionalWhere,
          },
          data: { order: { decrement: 1 } },
        });
      }

      await tx[modelName].update({
        where: { id },
        data: { order: newOrder },
      });
    };

    if (useTransaction) {
      await this.prisma.$transaction(async (tx) => {
        await updateOrderLogic(tx);
      });
    } else {
      await updateOrderLogic(this.prisma);
    }

    return true;
  }

  async reorderAfterDelete(
    modelName: string,
    deletedOrder: number,
    additionalWhere: Record<string, any>,
    tx?: any,
  ): Promise<void> {
    const client = tx ?? this.prisma;
    const model = client[modelName as keyof typeof client] as any;

    if (!model) {
      throw new Error(`Invalid model name: ${modelName}`);
    }

    await model.updateMany({
      where: {
        order: { gt: deletedOrder },
        ...additionalWhere,
      },
      data: { order: { decrement: 1 } },
    });
  }

  async getNextOrder(
    modelName: string,
    additionalWhere: Record<string, any>,
    tx?: any,
  ): Promise<number> {
    const client = tx ?? this.prisma;
    const model = client[modelName as keyof typeof client] as any;

    if (!model) {
      throw new Error(`Invalid model name: ${modelName}`);
    }

    const maxOrderItem = await model.findFirst({
      where: additionalWhere,
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    return maxOrderItem ? maxOrderItem.order + 1 : 1;
  }
}
