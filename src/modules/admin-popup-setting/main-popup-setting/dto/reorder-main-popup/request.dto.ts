import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, ValidateNested } from 'class-validator';

class ReorderItemDto {
  @ApiProperty({ description: '메인 팝업 ID', example: 1 })
  @IsInt()
  id: number;

  @ApiProperty({ description: '정렬 순서', example: 1 })
  @IsInt()
  order: number;
}

export class ReorderMainPopupReqDto {
  @ApiProperty({ description: '순서 변경 목록', type: [ReorderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
