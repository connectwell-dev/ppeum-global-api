import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SetEventProductItemDto } from '../set-product-event-products/request.dto';

export class PutEventProductItemDto extends SetEventProductItemDto {
  @ApiProperty({ description: '이벤트 할인율 (%)', example: 10.5 })
  @IsNumber()
  @Min(0)
  eventDiscountPercent: number;

  @ApiProperty({ description: '노출 순서', example: 1 })
  @IsNumber()
  @Min(0)
  order: number;
}

export class PutEventProductReqDto {
  @ApiProperty({ description: '이벤트 상품 수정 목록', type: [PutEventProductItemDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PutEventProductItemDto)
  products: PutEventProductItemDto[];
}