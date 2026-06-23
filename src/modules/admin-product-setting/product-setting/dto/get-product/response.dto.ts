import { ApiProperty } from '@nestjs/swagger';
import { Language } from '@prisma/client';

export class ProductImageResDto {
  @ApiProperty({ example: 'IMG00000001' })
  code: string;

  @ApiProperty({ example: '상품 이미지' })
  name: string;

  @ApiProperty({ example: 'uuid.jpg' })
  path: string;
}

export class GetProductDetailResDto {
  @ApiProperty({ example: 1, description: '상품 ID' })
  id: number;

  @ApiProperty({ example: 'PR001', description: '상품 코드' })
  code: string;

  @ApiProperty({ example: '상품명', description: '상품명' })
  productName: string;

  @ApiProperty({ example: '상품 설명', description: '상품 설명', required: false })
  productDescription: string;

  @ApiProperty({ example: 100000, description: '상품 금액' })
  productPrice: number;

  @ApiProperty({ example: 80000, description: '이벤트가', nullable: true })
  eventPrice: number | null;

  @ApiProperty({ description: '이미지 정보 (기준언어)', type: ProductImageResDto, nullable: true })
  image: ProductImageResDto | null;

  @ApiProperty({ example: '2026-01-01', description: '노출 시작일', nullable: true })
  startDate: string | null;

  @ApiProperty({ example: '2026-12-31', description: '노출 종료일', nullable: true })
  endDate: string | null;

  @ApiProperty({ example: true, description: '사용 여부' })
  isActive: boolean;

  @ApiProperty({ example: true, description: '기준언어 노출 여부' })
  isView: boolean;

  @ApiProperty({ example: 1, description: '연결 상세페이지 ID', nullable: true })
  productDetailInfoId: number | null;

  @ApiProperty({ example: '리프팅 상세페이지', description: '연결 상세페이지 타이틀 (요청 언어)', nullable: true })
  productDetailInfoTitle: string | null;

  @ApiProperty({ example: '2026-01-01', description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01', description: '수정일시' })
  updatedAt: Date;
}

export class GetProductTranslationNotMatchKeyResDto {
  @ApiProperty({ example: 'name', description: '변경해야 할 필드명' })
  key: string;

  @ApiProperty({ example: '기준값에서 변경된 항목입니다.', description: '에러 메시지' })
  message: string;
}

export class GetProductTranslationResDto {
  @ApiProperty({ example: '상품명', description: '번역 상품명' })
  name: string;

  @ApiProperty({ example: '상품명 (원문)', description: 'origin 상품명' })
  originName: string;

  @ApiProperty({ example: '상품 설명', description: '번역 상품 설명', nullable: true })
  description: string | null;

  @ApiProperty({ example: '상품 설명 (원문)', description: 'origin 상품 설명', nullable: true })
  originDescription: string | null;

  @ApiProperty({ description: '번역 이미지 정보 (없으면 기준언어)', type: ProductImageResDto, nullable: true })
  image: ProductImageResDto | null;

  @ApiProperty({ description: 'origin 이미지 정보', type: ProductImageResDto, nullable: true })
  originImage: ProductImageResDto | null;

  @ApiProperty({ example: true, description: '해당 언어권 노출 여부' })
  isView: boolean;

  @ApiProperty({ type: [GetProductTranslationNotMatchKeyResDto], description: '불일치 필드 목록' })
  notMatchKeys: GetProductTranslationNotMatchKeyResDto[];
}

export class GetProductListResDto {
  @ApiProperty({ example: 1, description: '상품 ID' })
  id: number;

  @ApiProperty({ example: 'PR001', description: '상품 코드' })
  code: string;

  @ApiProperty({ example: '상품명', description: '상품명 (요청 언어)' })
  name: string;

  @ApiProperty({ example: 100000, description: '상품 금액' })
  productPrice: number;

  @ApiProperty({ example: 80000, description: '이벤트가', nullable: true })
  eventPrice: number | null;

  @ApiProperty({ example: '2026-01-01', description: '노출 시작일', nullable: true })
  startDate: string | null;

  @ApiProperty({ example: '2026-12-31', description: '노출 종료일', nullable: true })
  endDate: string | null;

  @ApiProperty({ example: ['ko', 'en'], description: '미입력 언어', enum: Language, isArray: true })
  notInputLanguages: Language[];

  @ApiProperty({ example: true, description: '사용 여부' })
  isActive: boolean;

  @ApiProperty({ example: '2026-01-01', description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01', description: '수정일시' })
  updatedAt: Date;
}
