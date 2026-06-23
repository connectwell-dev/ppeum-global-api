import { ApiProperty } from '@nestjs/swagger';
import { Language, PopupBasicType } from '@prisma/client';

class basicPopupListResDto {
  @ApiProperty({ description: '기본 팝업 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '언어', enum: Language, example: Language.ko })
  language: Language;

  @ApiProperty({ description: '기본 팝업 타입', enum: PopupBasicType, example: PopupBasicType.pc })
  type: PopupBasicType;
}

class BasicPopupImageDto {
  @ApiProperty({ description: '이미지 경로', example: '/images/popup/sample.png' })
  path: string;
}

class BasicPopupCreatedDateDto {
  @ApiProperty({ description: '기본 팝업 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '생성일시', example: '2026-01-01 00:00:00' })
  createdAt: string;
}

export class GetBasicPopupListResDto {
  @ApiProperty({ description: '총 개수', example: 16 })
  total: number;

  @ApiProperty({ description: '약관 목록', type: [basicPopupListResDto] })
  policy: basicPopupListResDto[];
}

export class GetBasicPopupDetailResDto {
  @ApiProperty({ description: '기본 팝업 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '언어', enum: Language, example: Language.ko })
  language: Language;

  @ApiProperty({ description: '기본 팝업 타입', enum: PopupBasicType, example: PopupBasicType.pc })
  type: PopupBasicType;

  @ApiProperty({ description: '시작일', example: '2026-01-01' })
  startAt: string;

  @ApiProperty({ description: '시작시간', example: '09:00' })
  startTime: string;

  @ApiProperty({ description: '종료일', example: '2026-12-31' })
  endAt: string;

  @ApiProperty({ description: '종료시간', example: '18:00' })
  endTime: string;

  @ApiProperty({ description: '이미지 목록', type: [BasicPopupImageDto] })
  images: BasicPopupImageDto[];

  @ApiProperty({ description: '생성일시 목록', type: [BasicPopupCreatedDateDto] })
  createdDates: BasicPopupCreatedDateDto[];
}
