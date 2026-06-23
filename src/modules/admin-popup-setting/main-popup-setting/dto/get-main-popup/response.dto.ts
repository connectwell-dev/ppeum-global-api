import { ApiProperty } from '@nestjs/swagger';
import { Language, PopupType } from '@prisma/client';

class MainPopupCategoryListItemDto {
  @ApiProperty({ description: '카테고리 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '언어', enum: Language, example: Language.ko })
  language: Language;

  @ApiProperty({ description: '메인 팝업 타입', enum: PopupType, example: PopupType.pc })
  type: PopupType;
}

export class GetMainPopupCategoryListResDto {
  @ApiProperty({ description: '총 개수', example: 16 })
  total: number;

  @ApiProperty({ description: '메인 팝업 카테고리 목록', type: [MainPopupCategoryListItemDto] })
  popupMainCategory: MainPopupCategoryListItemDto[];
}

class MainPopupImageDto {
  @ApiProperty({ description: '이미지 경로', example: 'popup-main/abc.png' })
  path: string;
}

class MainPopupItemDto {
  @ApiProperty({ description: '메인 팝업 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '타이틀', example: '여름 프로모션' })
  title: string;

  @ApiProperty({ description: '링크', example: 'https://example.com', nullable: true })
  link: string | null;

  @ApiProperty({ description: '시작일', example: '2026-01-01' })
  startAt: string;

  @ApiProperty({ description: '시작시간', example: '09:00' })
  startTime: string;

  @ApiProperty({ description: '종료일', example: '2026-12-31' })
  endAt: string;

  @ApiProperty({ description: '종료시간', example: '18:00' })
  endTime: string;

  @ApiProperty({ description: '새창 여부', example: false })
  isNewTab: boolean;

  @ApiProperty({ description: '정렬 순서', example: 1 })
  order: number;

  @ApiProperty({ description: '이미지 목록', type: [MainPopupImageDto] })
  images: MainPopupImageDto[];
}

export class GetMainPopupCategoryDetailResDto {
  @ApiProperty({ description: '카테고리 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '언어', enum: Language, example: Language.ko })
  language: Language;

  @ApiProperty({ description: '메인 팝업 타입', enum: PopupType, example: PopupType.pc })
  type: PopupType;

  @ApiProperty({ description: '메인 팝업 목록', type: [MainPopupItemDto] })
  popupMains: MainPopupItemDto[];
}
