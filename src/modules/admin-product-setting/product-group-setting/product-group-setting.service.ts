import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { CustomException } from '@common/exceptions';
import { CommonSetResponseDto } from '@common/dto/common-response.dto';
import { SetProductGroupReqDto, GetProductGroupResDto } from './dto/product-group.dto';

@Injectable()
export class ProductGroupSettingService {
  constructor(private readonly prisma: PrismaService) {}

  /** GRP_YYYYMMDD_0001 형식 코드 자동생성 */
  private async generateCode(): Promise<string> {
    const now = new Date();
    const dateStr = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('');

    const prefix = `GRP_${dateStr}_`;

    const last = await this.prisma.productGroup.findFirst({
      where: { code: { startsWith: prefix } },
      orderBy: { code: 'desc' },
      select: { code: true },
    });

    let seq = 1;
    if (last) {
      const tail = last.code.slice(prefix.length);
      const parsed = parseInt(tail, 10);
      if (!isNaN(parsed)) seq = parsed + 1;
    }

    return `${prefix}${String(seq).padStart(4, '0')}`;
  }

  async getProductGroupList(): Promise<GetProductGroupResDto[]> {
    try {
      const list = await this.prisma.productGroup.findMany({ orderBy: { createdAt: 'desc' } });
      return list.map((g) => ({
        id: g.id,
        code: g.code,
        name: g.name,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
      }));
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  async getProductGroup(id: number): Promise<GetProductGroupResDto> {
    try {
      const group = await this.prisma.productGroup.findUnique({ where: { id } });
      if (!group) throw new CustomException('common.not_found', 'BAD_REQUEST');
      return {
        id: group.id,
        code: group.code,
        name: group.name,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  async setProductGroup(dto: SetProductGroupReqDto): Promise<CommonSetResponseDto> {
    try {
      const code = await this.generateCode();
      const created = await this.prisma.productGroup.create({
        data: { code, name: dto.name },
      });
      return { id: created.id };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  async putProductGroup(id: number, dto: SetProductGroupReqDto): Promise<string> {
    try {
      const group = await this.prisma.productGroup.findUnique({ where: { id } });
      if (!group) throw new CustomException('common.not_found', 'BAD_REQUEST');
      await this.prisma.productGroup.update({
        where: { id },
        data: { name: dto.name },
      });
      return 'update product group success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }

  async deleteProductGroup(id: number): Promise<string> {
    try {
      const group = await this.prisma.productGroup.findUnique({ where: { id } });
      if (!group) throw new CustomException('common.not_found', 'BAD_REQUEST');
      await this.prisma.productGroup.delete({ where: { id } });
      return 'delete product group success';
    } catch (error) {
      if (error instanceof CustomException) throw error;
      throw new CustomException();
    }
  }
}
