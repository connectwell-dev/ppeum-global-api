import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { OmitType } from '@nestjs/swagger';
import { Language } from '@prisma/client';
import { Type } from 'class-transformer';
import { SetProductCategoryReqDto, CategoryProductItemDto } from '../set-product-category/request.dto';

export class PutProductCategoryReqDto extends OmitType(SetProductCategoryReqDto, ['categoryTranslations', 'products'] as const) {
  @ApiProperty({ description: '카테고리명 (기준언어)', example: '카테고리명' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  name: string;

  @ApiProperty({ description: '이미지 Code', example: 'IMG_New_Category', required: false, nullable: true })
  @IsString()
  @IsOptional()
  imageCode?: string;

  @ApiProperty({ description: '단순 변경 여부 (true: changedKeys 갱신 안함)', example: false })
  @IsBoolean()
  @IsNotEmpty()
  isSimpleChange: boolean;

  @ApiProperty({ description: '카테고리 상품 목록 (전체 교체)', type: [CategoryProductItemDto], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CategoryProductItemDto)
  products?: CategoryProductItemDto[];
}

export class PutProductCategoryTranslationReqDto {
  @ApiProperty({ description: '언어', example: 'en', enum: Language })
  @IsEnum(Language)
  @IsNotEmpty()
  language: Language;

  @ApiProperty({ description: '카테고리명' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  name: string;

  @ApiProperty({ description: '이미지 Code', example: 'IMG_New_Category', required: false, nullable: true })
  @IsString()
  @IsOptional()
  imageCode?: string;

  @ApiProperty({ description: '노출 여부', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isView?: boolean;
}

export class PutProductCategoryPublicTranslationReqDto extends PutProductCategoryTranslationReqDto {
  @ApiProperty({ description: '단순변경 여부 (true: changedKeys 갱신 안함)', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isSimpleChange?: boolean;
}
