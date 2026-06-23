import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OmitType } from '@nestjs/swagger';
import { SetProductReqDto } from '../set-product/request.dto';
import { Language } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { EmptyToCustomValue } from '@common/decorators/empty-to-custom-value';

export class PutProductReqDto extends OmitType(SetProductReqDto, ['productTranslations'] as const) {
  @ApiProperty({ description: '상품명 (기준언어)' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '상품 설명 (기준언어)', required: false })
  @IsOptional()
  @IsString()
  @EmptyToCustomValue()
  description?: string;

  @ApiProperty({ description: '이미지 code (기준언어)', required: false })
  @IsOptional()
  @IsString()
  @EmptyToCustomValue()
  imageCode?: string;

  @ApiProperty({ description: '해당 언어권 노출 여부 (기준언어)', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isView?: boolean;

  @ApiProperty({ description: '단순 변경 여부 (true: changedKeys 갱신 안함)', example: false })
  @IsBoolean()
  @IsNotEmpty()
  isSimpleChange: boolean;
}

export class PutProductTranslationReqDto {
  @ApiProperty({ description: '언어', example: 'en', enum: Language })
  @IsEnum(Language)
  @IsNotEmpty()
  language: Language;

  @ApiProperty({ description: '상품명' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '상품 설명', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '이미지 code (없으면 기준언어 사용)', required: false })
  @IsOptional()
  @IsString()
  @EmptyToCustomValue()
  imageCode?: string;

  @ApiProperty({ description: '해당 언어권 노출 여부', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isView?: boolean;
}

export class PutProductPublicTranslationReqDto extends PutProductTranslationReqDto {
  @ApiProperty({ description: '단순변경 여부 (true: changedKeys 갱신 안함)', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isSimpleChange?: boolean;
}
