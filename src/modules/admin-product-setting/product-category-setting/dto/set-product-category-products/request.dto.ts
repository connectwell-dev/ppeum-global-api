import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SetCategoryProductItemDto {
  @ApiProperty({ description: '상품 ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ description: '이벤트 가격', example: 90000 })
  @IsNumber()
  @Min(0)
  eventPrice: number;
}



export class SetCategoryProductsReqDto {
  @ApiProperty({ description: '카테고리 상품 목록', type: [SetCategoryProductItemDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SetCategoryProductItemDto)
  products: SetCategoryProductItemDto[];
}
