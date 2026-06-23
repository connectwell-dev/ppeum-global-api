import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { OmitType } from '@nestjs/swagger';
import { Language } from '@prisma/client';
import { SetProductCategoryReqDto } from '../set-product-category/request.dto';

export class PutProductCategoryReqDto extends OmitType(SetProductCategoryReqDto, ['categoryTranslations'] as const) {
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
}

export class PutProductCategoryPublicTranslationReqDto extends PutProductCategoryTranslationReqDto {
  @ApiProperty({ description: '단순변경 여부 (true: changedKeys 갱신 안함)', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isSimpleChange?: boolean;
}
