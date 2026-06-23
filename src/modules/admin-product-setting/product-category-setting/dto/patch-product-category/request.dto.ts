import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCategoryType } from '@prisma/client';

export class PatchProductCategoryOrderItemDto {
  @ApiProperty({ description: '카테고리 ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ description: '순서', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  order: number;
}

export class PatchProductCategoryOrderReqDto {
  @ApiProperty({ description: '카테고리 타입', enum: ProductCategoryType, example: ProductCategoryType.general })
  @IsEnum(ProductCategoryType)
  @IsNotEmpty()
  categoryType: ProductCategoryType;

  @ApiProperty({ description: '카테고리 순서 일괄 수정 목록', type: [PatchProductCategoryOrderItemDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PatchProductCategoryOrderItemDto)
  items: PatchProductCategoryOrderItemDto[];
}
