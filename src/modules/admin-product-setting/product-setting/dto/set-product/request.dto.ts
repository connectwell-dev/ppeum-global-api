import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EmptyToCustomValue } from '@common/decorators/empty-to-custom-value';
import { Language } from '@prisma/client';

export class SetProductTranslationDto {
  @ApiProperty({ description: '언어', example: 'ko', enum: Language })
  @IsEnum(Language)
  @IsNotEmpty()
  language: Language;

  @ApiProperty({ description: '상품명', example: '상품명', required: false })
  @IsOptional()
  @IsString()
  @EmptyToCustomValue()
  name?: string;

  @ApiProperty({ description: '상품 설명', example: '상품 설명', required: false })
  @IsOptional()
  @IsString()
  @EmptyToCustomValue()
  description?: string;

  @ApiProperty({ description: '이미지 code (없으면 기준언어 사용)', example: 'IMG00000001', required: false })
  @IsOptional()
  @IsString()
  @EmptyToCustomValue()
  imageCode?: string;

  @ApiProperty({ description: '해당 언어권 노출 여부', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isView?: boolean;
}

export class SetProductReqDto {
  @ApiProperty({ description: '상품 분류 ID', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  productCategoryId: number;

  @ApiProperty({ description: '상품 금액', example: 100000 })
  @IsNumber()
  @IsNotEmpty()
  productPrice: number;

  @ApiProperty({ description: '이벤트가', example: 80000, required: false })
  @IsOptional()
  @IsNumber()
  eventPrice?: number;

  @ApiProperty({ description: '노출 시작일', example: '2026-01-01', required: false })
  @IsOptional()
  @IsString()
  @EmptyToCustomValue()
  startDate?: string;

  @ApiProperty({ description: '노출 종료일', example: '2026-12-31', required: false })
  @IsOptional()
  @IsString()
  @EmptyToCustomValue()
  endDate?: string;

  @ApiProperty({ description: '사용 여부', example: true })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @ApiProperty({ description: '연결 시술설명 ID (OperationInfo)', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  operationInfoId?: number;

  @ApiProperty({ description: '언어별 상품명 목록', type: [SetProductTranslationDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetProductTranslationDto)
  productTranslations?: SetProductTranslationDto[];
}
