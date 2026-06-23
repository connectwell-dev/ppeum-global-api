import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Language, ProductCategoryType, WeekDayType } from '@prisma/client';
import { EmptyToCustomValue } from '@common/decorators/empty-to-custom-value';

export class ProductCategoryTranslationDto {
  @ApiProperty({ description: '언어', example: 'ko', enum: Language })
  @IsEnum(Language)
  @IsNotEmpty()
  language: Language;

  @ApiProperty({ description: '카테고리명', example: '카테고리명' })
  @IsOptional()
  @IsString()
  @EmptyToCustomValue()
  name?: string;

  @ApiProperty({ description: '이미지 Code', example: 'IMG_New_Category', required: false, nullable: true })
  @IsString()
  @IsOptional()
  imageCode?: string;
}

export class SetProductCategoryReqDto {
  @ApiProperty({ description: '카테고리 타입', enum: ProductCategoryType, example: ProductCategoryType.general })
  @IsEnum(ProductCategoryType)
  @IsNotEmpty()
  categoryType: ProductCategoryType;

  @ApiProperty({ description: '노출 시작일시 (YYYY-MM-DD HH:MM)', example: '2026-01-01 10:00', required: false, nullable: true })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: '노출 종료일시 (YYYY-MM-DD HH:MM, null이면 상시)', example: '2026-12-31 23:59', required: false, nullable: true })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ description: '예약가능 시작일시 (YYYY-MM-DD HH:MM)', example: '2026-01-01 10:00', required: false, nullable: true })
  @IsString()
  @IsOptional()
  reservationStartDate?: string;

  @ApiProperty({ description: '예약가능 종료일시 (YYYY-MM-DD HH:MM, null이면 상시)', example: '2026-12-31 23:59', required: false, nullable: true })
  @IsString()
  @IsOptional()
  reservationEndDate?: string;

  @ApiProperty({ description: '요일 목록 (요일 카테고리 시)', enum: WeekDayType, isArray: true, example: ['mon', 'wed'], required: false })
  @IsArray()
  @IsEnum(WeekDayType, { each: true })
  @IsOptional()
  weekDay?: WeekDayType[];

  @ApiProperty({ description: '사용 여부', example: true })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @ApiProperty({ description: '언어별 카테고리명', type: [ProductCategoryTranslationDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ProductCategoryTranslationDto)
  categoryTranslations: ProductCategoryTranslationDto[];
}
