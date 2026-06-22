import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PatchMenuBoardStatusItemDto {
  @ApiProperty({ description: '상품 ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ description: '순서', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  order: number;
}

export class PatchMenuBoardStatusReqDto {
  @ApiProperty({ description: '메뉴판 분류 ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  productCategoryId: number;

  @ApiProperty({ description: '상태 목록', type: [PatchMenuBoardStatusItemDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PatchMenuBoardStatusItemDto)
  items: PatchMenuBoardStatusItemDto[];
}
