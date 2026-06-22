import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SetEventProductItemDto {
  @ApiProperty({ description: '상품 ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ description: '이벤트 가격', example: 90000 })
  @IsNumber()
  @Min(0)
  eventPrice: number;
}



export class SetEventProductsReqDto {
  @ApiProperty({ description: '이벤트 상품 목록', type: [SetEventProductItemDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SetEventProductItemDto)
  products: SetEventProductItemDto[];
}




