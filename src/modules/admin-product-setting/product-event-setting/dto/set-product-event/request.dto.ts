import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Language, ProductEventType, WeekDayType } from '@prisma/client';
import { EmptyToCustomValue } from '@common/decorators/empty-to-custom-value';

export class ProductEventTranslationDto {
  @ApiProperty({ description: '언어', example: 'ja', enum: Language })
  @IsEnum(Language)
  @IsNotEmpty()
  language: Language;

  @ApiProperty({ description: '이벤트명', example: '이벤트명' })
  @IsOptional()
  @IsString()
  @EmptyToCustomValue()
  name?: string;

  @ApiProperty({ description: '이미지 Code', example: 'IMG_New_Event', required: false, nullable: true })
  @IsString()
  @IsOptional()
  imageCode?: string;
}

export class SetProductEventReqDto {
  @ApiProperty({ description: '라벨 내용', example: '신규' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  label: string;

  @ApiProperty({ description: '배경 색상 코드', example: 'FFFFFF' })
  @IsString()
  @IsNotEmpty()
  colorBg: string;

  @ApiProperty({ description: '라인 색상 코드', example: '333333' })
  @IsString()
  @IsNotEmpty()
  colorLine: string;

  @ApiProperty({ description: '텍스트 색상 코드', example: '333333' })
  @IsString()
  @IsNotEmpty()
  colorText: string;

  @ApiProperty({ description: '이벤트 타입', enum: ProductEventType, example: ProductEventType.general })
  @IsEnum(ProductEventType)
  @IsNotEmpty()
  eventType: ProductEventType;

  @ApiProperty({ description: '시작일시 (YYYY-MM-DD HH:MM)', example: '2026-01-01 10:00', required: false, nullable: true })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: '종료일시 (YYYY-MM-DD HH:MM, null이면 상시)', example: '2026-12-31 23:59', required: false, nullable: true })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ description: '요일 목록 (요일 이벤트 시)', enum: WeekDayType, isArray: true, example: ['mon', 'wed'], required: false })
  @IsArray()
  @IsEnum(WeekDayType, { each: true })
  @IsOptional()
  weekDay?: WeekDayType[];

  @ApiProperty({ description: '사용 여부', example: true })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @ApiProperty({ description: '언어별 이벤트명', type: [ProductEventTranslationDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ProductEventTranslationDto)
  eventTranslations: ProductEventTranslationDto[];
}
