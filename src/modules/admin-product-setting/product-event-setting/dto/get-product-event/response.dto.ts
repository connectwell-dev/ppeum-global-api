import { ApiProperty } from '@nestjs/swagger';
import { Language, ProductEventType, ProductType, WeekDayType } from '@prisma/client';

export class EventImageResDto {
  @ApiProperty({ example: 'IMG_xxxxxxxx' })
  code: string;

  @ApiProperty({ example: 'Fairy Ear Filler' })
  name: string;

  @ApiProperty({ example: 'uuid.jpg' })
  path: string;
}

export class ProductEventTranslationResDto {
  @ApiProperty({ example: 'ja', enum: Language, description: '언어' })
  language: Language;

  @ApiProperty({ example: '이벤트명', description: '이벤트명' })
  name: string;

  @ApiProperty({ example: 'IMG001', description: '이미지 ID', nullable: true })
  imageId: string | null;

  @ApiProperty({ example: false, description: '매칭 여부' })
  isMatch: boolean;

  @ApiProperty({ example: [{ key: 'name', message: 'common.translation_not_filled' }], description: '미매칭 키 목록 (detail 전용)', required: false })
  notMatchKeys?: { key: string; message: string }[];
}

export class GetProductEventTranslationNotMatchKeyResDto {
  @ApiProperty({ example: 'name', description: '변경해야 할 필드명' })
  key: string;

  @ApiProperty({ example: '기준값에서 변경된 항목입니다.', description: '에러 메시지' })
  message: string;
}

export class GetProductEventTranslationResDto {
  @ApiProperty({ example: '이벤트명', description: '번역 이벤트명' })
  name: string;

  @ApiProperty({ description: '번역 이미지 정보', type: EventImageResDto, nullable: true })
  image: EventImageResDto | null;

  @ApiProperty({ example: '이벤트명 (원문)', description: 'origin 이벤트명' })
  originName: string;

  @ApiProperty({ description: 'origin 이미지 정보', type: EventImageResDto, nullable: true })
  originImage: EventImageResDto | null;

  @ApiProperty({ type: [GetProductEventTranslationNotMatchKeyResDto], description: '불일치 필드 목록' })
  notMatchKeys: GetProductEventTranslationNotMatchKeyResDto[];
}

export class GetProductEventListResDto {
  @ApiProperty({ example: 1, description: '이벤트 ID' })
  id: number;

  @ApiProperty({ example: 'EVT20260101', description: '이벤트 코드' })
  code: string;

  @ApiProperty({ example: 1, description: '노출 순서' })
  order: number;

  @ApiProperty({ example: '이벤트명', description: '이벤트명' })
  name: string;

  @ApiProperty({ example: true, description: '사용 여부' })
  isActive: boolean;

  @ApiProperty({ example: ProductEventType.general, enum: ProductEventType, description: '이벤트 타입' })
  eventType: ProductEventType;

  @ApiProperty({ example: '2026-01-01 10:00', description: '시작일시', nullable: true })
  startDate: string | null;

  @ApiProperty({ example: '2026-12-31 23:59', description: '종료일시 (null이면 상시)', nullable: true })
  endDate: string | null;

  @ApiProperty({ example: ['mon', 'wed'], enum: WeekDayType, isArray: true, description: '요일 목록' })
  weekDay: WeekDayType[];

  // @ApiProperty({ description: '번역 목록', type: [ProductEventTranslationResDto] })
  // translations: ProductEventTranslationResDto[];

  @ApiProperty({ example: ['ko', 'en'], description: '미입력 언어', enum: Language, isArray: true })
  notInputLanguages?: Language[];

  @ApiProperty({ example: '2026-01-01', description: '생성일시' })
  createdAt: Date;
}


export class GetProductEventDetailResDto {
  @ApiProperty({ example: 'EVT20260101', description: '이벤트 ID' })
  id: string;

  @ApiProperty({ example: '이벤트명', description: '이벤트명' })
  name: string;

  @ApiProperty({ example: '이벤트 이미지', description: '이벤트 이미지', required: false })
  image: EventImageResDto | null;

  @ApiProperty({ example: true, description: '사용 여부' })
  isActive: boolean;

  @ApiProperty({ example: '신규', description: '라벨 내용' })
  label: string;

  @ApiProperty({ example: 'FFFFFF', description: '배경 색상 코드' })
  colorBg: string;

  @ApiProperty({ example: '333333', description: '라인 색상 코드' })
  colorLine: string;

  @ApiProperty({ example: '333333', description: '텍스트 색상 코드' })
  colorText: string;

  @ApiProperty({ example: ProductEventType.general, enum: ProductEventType, description: '이벤트 타입' })
  eventType: ProductEventType;

  @ApiProperty({ example: '2026-01-01 10:00', description: '시작일시', nullable: true })
  startDate: string | null;

  @ApiProperty({ example: '2026-12-31 23:59', description: '종료일시 (null이면 상시)', nullable: true })
  endDate: string | null;

  @ApiProperty({ example: ['mon', 'wed'], enum: WeekDayType, isArray: true, description: '요일 목록' })
  weekDay: WeekDayType[];


  @ApiProperty({ example: '2026-01-01', description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01', description: '수정일시' })
  updatedAt: Date;
}
