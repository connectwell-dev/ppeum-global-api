import { ApiProperty } from '@nestjs/swagger';
import { Language } from '@prisma/client';

export class ShortDescriptionItemResDto {
  @ApiProperty({ example: '마취시간' })
  key: string;

  @ApiProperty({ example: '약 30분' })
  value: string;
}

export class NotMatchKeyResDto {
  @ApiProperty({ example: 'title', description: '변경해야할 필드명' })
  key: string;

  @ApiProperty({ example: '기준값에서 사용되지 않은 항목입니다.', description: '에러 메시지' })
  message: string;
}

export class ImageResDto {
  @ApiProperty({ example: 'IMG_Fairy_Ear_Filler' })
  id: string;

  @ApiProperty({ example: 'Fairy Ear Filler' })
  name: string;

  @ApiProperty({ example: 'uuid.jpg' })
  path: string;
}

// 리스트 응답
export class GetOperationInfoListResDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '립 필러', nullable: true })
  title: string | null;

  @ApiProperty({ example: ['필러', '리프팅'], type: [String] })
  hashtag: string[];

  @ApiProperty({ example: '영어 검수 필요', nullable: true })
  note: string | null;

  @ApiProperty({ example: ['ko', 'en'], description: '미입력 언어', enum: Language, isArray: true })
  notInputLanguages: Language[];

  @ApiProperty({ example: '2026-02-19T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-02-19T10:00:00.000Z' })
  updatedAt: Date;
}

// 상세 응답 (기준언어)
export class GetOperationInfoDetailResDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '립 필러', nullable: true })
  title: string | null;

  @ApiProperty({ example: '립 필러는 입술에 필러를 주입하는 시술입니다.', nullable: true })
  description: string | null;

  @ApiProperty({ type: [ShortDescriptionItemResDto] })
  shortDescription: ShortDescriptionItemResDto[];

  @ApiProperty({ type: ImageResDto, nullable: true })
  image: ImageResDto | null;

  @ApiProperty({ example: ['필러', '리프팅'], type: [String] })
  hashtag: string[];

  @ApiProperty({ example: ['시술 후 2~3시간 동안 세안을 하지 말아 주세요.'], type: [String] })
  caution: string[];

  @ApiProperty({ example: '영어 검수 필요', nullable: true })
  note: string | null;

  @ApiProperty({ type: [NotMatchKeyResDto] })
  notMatchKeys?: NotMatchKeyResDto[];

  @ApiProperty({ example: '2026-02-19T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-02-19T10:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: '2026-02-19T10:00:00.000Z', description: '해당언어 마지막 변경 시간' })
  translationUpdatedAt: Date;
}
