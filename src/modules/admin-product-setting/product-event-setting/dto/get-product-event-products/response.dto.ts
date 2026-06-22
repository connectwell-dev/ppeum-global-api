import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductType } from '@prisma/client';

export class GetEventProductResDto {
  @ApiProperty({ description: '상품 ID', example: 172 })
  productId: number;

  @ApiProperty({ description: '이벤트 가격', example: 90000 })
  eventPrice: number;

  @ApiProperty({ description: '이벤트 할인율 (%)', example: 10.5 })
  eventDiscountPercent: number;

  @ApiProperty({ description: '노출 순서', example: 1 })
  order: number;

  @ApiProperty({ description: '상품명', example: '상품명' })
  name: string;

  @ApiProperty({ description: '상품 분류명', example: '상품 분류명' })
  categoryName: string;

  @ApiProperty({ description: '상품 타입', example: ProductType.single })
  productType: ProductType;

  @ApiProperty({ description: '상품 가격', example: 100000 })
  productPrice: number;

  @ApiProperty({ description: '과세 여부', example: true })
  isTaxIncluded: boolean;
}
