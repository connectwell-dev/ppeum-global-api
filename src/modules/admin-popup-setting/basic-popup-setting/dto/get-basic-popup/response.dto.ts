import { ApiProperty } from '@nestjs/swagger';
import { Language, PopupType } from '@prisma/client';

class BasicPopupCategoryListItemDto {
  @ApiProperty({ description: '카테고리 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '언어', enum: Language, example: Language.ko })
  language: Language;

  @ApiProperty({ description: '기본 팝업 타입', enum: PopupType, example: PopupType.pc })
  type: PopupType;
}

export class GetBasicPopupCategoryListResDto {
  @ApiProperty({ description: '총 개수', example: 16 })
  total: number;

  @ApiProperty({ description: '기본 팝업 카테고리 목록', type: [BasicPopupCategoryListItemDto] })
  popupBasicCategory: BasicPopupCategoryListItemDto[];
}

class BasicPopupImageDto {
  @ApiProperty({ description: '이미지 경로', example: 'popup-basic/abc.png' })
  path: string;
}

class BasicPopupItemDto {
  @ApiProperty({ description: '기본 팝업 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '시작일', example: '2026-01-01' })
  startAt: string;

  @ApiProperty({ description: '시작시간', example: '09:00' })
  startTime: string;

  @ApiProperty({ description: '종료일', example: '2026-12-31' })
  endAt: string;

  @ApiProperty({ description: '종료시간', example: '18:00' })
  endTime: string;

  @ApiProperty({ description: '생성일시', example: '2026-01-01 00:00:00' })
  createdAt: string;

  @ApiProperty({ description: '이미지 목록', type: [BasicPopupImageDto] })
  images: BasicPopupImageDto[];
}

export class GetBasicPopupCategoryDetailResDto {
  @ApiProperty({ description: '카테고리 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '언어', enum: Language, example: Language.ko })
  language: Language;

  @ApiProperty({ description: '기본 팝업 타입', enum: PopupType, example: PopupType.pc })
  type: PopupType;

  @ApiProperty({ description: '기본 팝업 목록', type: [BasicPopupItemDto] })
  popupBasics: BasicPopupItemDto[];
}
