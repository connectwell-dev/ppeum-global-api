import { ApiProperty } from '@nestjs/swagger';
import { Language, ProductCategoryType, WeekDayType } from '@prisma/client';

export class CategoryImageResDto {
  @ApiProperty({ example: 'IMG_xxxxxxxx' })
  code: string;

  @ApiProperty({ example: 'Fairy Ear Filler' })
  name: string;

  @ApiProperty({ example: 'uuid.jpg' })
  path: string;
}

export class ProductCategoryTranslationResDto {
  @ApiProperty({ example: 'ja', enum: Language, description: '언어' })
  language: Language;

  @ApiProperty({ example: '카테고리명', description: '카테고리명' })
  name: string;

  @ApiProperty({ example: 'IMG001', description: '이미지 ID', nullable: true })
  imageId: string | null;

  @ApiProperty({ example: false, description: '매칭 여부' })
  isMatch: boolean;

  @ApiProperty({ example: [{ key: 'name', message: 'common.translation_not_filled' }], description: '미매칭 키 목록 (detail 전용)', required: false })
  notMatchKeys?: { key: string; message: string }[];
}

export class GetProductCategoryTranslationNotMatchKeyResDto {
  @ApiProperty({ example: 'name', description: '변경해야 할 필드명' })
  key: string;

  @ApiProperty({ example: '기준값에서 변경된 항목입니다.', description: '에러 메시지' })
  message: string;
}

export class GetProductCategoryTranslationResDto {
  @ApiProperty({ example: '카테고리명', description: '번역 카테고리명' })
  name: string;

  @ApiProperty({ description: '번역 이미지 정보', type: CategoryImageResDto, nullable: true })
  image: CategoryImageResDto | null;

  @ApiProperty({ example: '카테고리명 (원문)', description: 'origin 카테고리명' })
  originName: string;

  @ApiProperty({ description: 'origin 이미지 정보', type: CategoryImageResDto, nullable: true })
  originImage: CategoryImageResDto | null;

  @ApiProperty({ type: [GetProductCategoryTranslationNotMatchKeyResDto], description: '불일치 필드 목록' })
  notMatchKeys: GetProductCategoryTranslationNotMatchKeyResDto[];
}

export class GetProductCategoryListResDto {
  @ApiProperty({ example: 1, description: '카테고리 ID' })
  id: number;

  @ApiProperty({ example: 'EVT20260101', description: '카테고리 코드' })
  code: string;

  @ApiProperty({ example: 1, description: '노출 순서' })
  order: number;

  @ApiProperty({ example: '카테고리명', description: '카테고리명' })
  name: string;

  @ApiProperty({ example: true, description: '사용 여부' })
  isActive: boolean;

  @ApiProperty({ example: ProductCategoryType.general, enum: ProductCategoryType, description: '카테고리 타입' })
  categoryType: ProductCategoryType;

  @ApiProperty({ example: '2026-01-01 10:00', description: '노출 시작일시', nullable: true })
  startDate: string | null;

  @ApiProperty({ example: '2026-12-31 23:59', description: '노출 종료일시 (null이면 상시)', nullable: true })
  endDate: string | null;

  @ApiProperty({ example: '2026-01-01 10:00', description: '예약가능 시작일시', nullable: true })
  reservationStartDate: string | null;

  @ApiProperty({ example: '2026-12-31 23:59', description: '예약가능 종료일시 (null이면 상시)', nullable: true })
  reservationEndDate: string | null;

  @ApiProperty({ example: ['mon', 'wed'], enum: WeekDayType, isArray: true, description: '요일 목록' })
  weekDay: WeekDayType[];

  @ApiProperty({ example: ['ko', 'en'], description: '미입력 언어', enum: Language, isArray: true })
  notInputLanguages?: Language[];

  @ApiProperty({ example: '2026-01-01', description: '생성일시' })
  createdAt: Date;
}


export class GetProductCategoryDetailResDto {
  @ApiProperty({ example: 'EVT20260101', description: '카테고리 ID' })
  id: string;

  @ApiProperty({ example: '카테고리명', description: '카테고리명' })
  name: string;

  @ApiProperty({ example: '카테고리 이미지', description: '카테고리 이미지', required: false })
  image: CategoryImageResDto | null;

  @ApiProperty({ example: true, description: '사용 여부' })
  isActive: boolean;

  @ApiProperty({ example: ProductCategoryType.general, enum: ProductCategoryType, description: '카테고리 타입' })
  categoryType: ProductCategoryType;

  @ApiProperty({ example: '2026-01-01 10:00', description: '노출 시작일시', nullable: true })
  startDate: string | null;

  @ApiProperty({ example: '2026-12-31 23:59', description: '노출 종료일시 (null이면 상시)', nullable: true })
  endDate: string | null;

  @ApiProperty({ example: '2026-01-01 10:00', description: '예약가능 시작일시', nullable: true })
  reservationStartDate: string | null;

  @ApiProperty({ example: '2026-12-31 23:59', description: '예약가능 종료일시 (null이면 상시)', nullable: true })
  reservationEndDate: string | null;

  @ApiProperty({ example: ['mon', 'wed'], enum: WeekDayType, isArray: true, description: '요일 목록' })
  weekDay: WeekDayType[];


  @ApiProperty({ example: '2026-01-01', description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01', description: '수정일시' })
  updatedAt: Date;
}
