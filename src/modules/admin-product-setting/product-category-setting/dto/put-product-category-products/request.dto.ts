import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SetCategoryProductItemDto } from '../set-product-category-products/request.dto';

export class PutCategoryProductItemDto extends SetCategoryProductItemDto {
  @ApiProperty({ description: '이벤트 할인율 (%)', example: 10.5 })
  @IsNumber()
  @Min(0)
  eventDiscountPercent: number;

  @ApiProperty({ description: '노출 순서', example: 1 })
  @IsNumber()
  @Min(0)
  order: number;
}

export class PutCategoryProductReqDto {
  @ApiProperty({ description: '카테고리 상품 수정 목록', type: [PutCategoryProductItemDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PutCategoryProductItemDto)
  products: PutCategoryProductItemDto[];
}
