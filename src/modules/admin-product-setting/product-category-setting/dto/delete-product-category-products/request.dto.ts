import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteCategoryProductsReqDto {
  @ApiProperty({ description: '삭제할 상품 ID 목록', type: [Number], example: [1, 2] })
  @IsArray()
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  productIds: number[];
}
