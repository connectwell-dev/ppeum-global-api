import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PatchProductEventOrderItemDto {
  @ApiProperty({ description: '이벤트 ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ description: '순서', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  order: number;
}

export class PatchProductEventOrderReqDto {
  @ApiProperty({ description: '이벤트 순서 일괄 수정 목록', type: [PatchProductEventOrderItemDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PatchProductEventOrderItemDto)
  items: PatchProductEventOrderItemDto[];
}
