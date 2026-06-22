import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PatchProductCategoryItemDto {
  @ApiProperty({ description: '분류 ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ description: '순서', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  order: number;

  @ApiProperty({ description: '사용 여부', example: true })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}

export class PatchProductCategoryStatusReqDto {
  @ApiProperty({ description: '대분류 일괄 수정 목록', type: [PatchProductCategoryItemDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PatchProductCategoryItemDto)
  mainItems: PatchProductCategoryItemDto[];

  @ApiProperty({ description: '현재 열린 중분류 일괄 수정 목록', type: [PatchProductCategoryItemDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PatchProductCategoryItemDto)
  subItems: PatchProductCategoryItemDto[];
}
