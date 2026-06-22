import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DeleteEventProductsReqDto {
  @ApiProperty({ description: '삭제할 상품 ID 목록', type: [Number], example: [1, 2] })
  @IsArray()
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  productIds: number[];
}
