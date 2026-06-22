import { ApiProperty } from '@nestjs/swagger';
import { GeneralImageType } from '@prisma/client';

export class GetImageCategoryListResDto {
  @ApiProperty({ description: '이미지 분류 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '이미지 분류 명', example: '상품 이미지' })
  name: string;

  @ApiProperty({ description: '이미지 타입', enum: GeneralImageType, example: GeneralImageType.product, nullable: true })
  type: GeneralImageType | null;
}

export class GetImageCategoryDetailResDto {
  @ApiProperty({ description: '이미지 분류 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '이미지 분류 명', example: '상품 이미지' })
  name: string;

  @ApiProperty({ description: '이미지 타입', enum: GeneralImageType, example: GeneralImageType.product, nullable: true })
  type: GeneralImageType | null;

  @ApiProperty({ description: '생성일시', example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시', example: '2026-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
