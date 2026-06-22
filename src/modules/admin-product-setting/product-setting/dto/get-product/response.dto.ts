import { ApiProperty } from '@nestjs/swagger';
import { Language } from '@prisma/client';
import { ActiveTarget, ProductType } from '@prisma/client';


export class ImageResDto {
  @ApiProperty({ example: 'IMG_Fairy_Ear_Filler' })
  code: string;

  @ApiProperty({ example: 'Fairy Ear Filler' })
  name: string;

  @ApiProperty({ example: 'uuid.jpg' })
  path: string;
}

export class ProductMenuBoardListResDto {
  @ApiProperty({ example: 1, description: '메뉴판 분류 ID' })
  categoryId: number;

  @ApiProperty({ example: '대분류명', description: '대분류명', required: false })
  mainCategoryName: string;

  @ApiProperty({ example: '중분류명', description: '중분류명', required: false })
  subCategoryName: string;
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

  @ApiProperty({ example: '대분류명', description: '대분류명', required: false })
  productMainCategoryName: string;

  @ApiProperty({ example: '중분류명', description: '중분류명', required: false })
  productSubCategoryName: string;

  @ApiProperty({ example: 1, description: '상품 분류 ID', required: false })
  productCategoryId: number;

  @ApiProperty({ example: ProductType.single, description: '상품 타입', enum: ProductType })
  productType: ProductType;

  @ApiProperty({ example: 100000, description: '상품 금액' })
  productPrice: number;

  @ApiProperty({ example: '상품 비고', description: '상품 비고', required: false })
  productNote: string;

  @ApiProperty({ example: [ActiveTarget.crm], description: '노출 대상', enum: ActiveTarget, isArray: true })
  activeTarget: ActiveTarget[];


  @ApiProperty({ example: true, description: '과세 여부' })
  isTaxIncluded: boolean;

  @ApiProperty({ example: true, description: 'VAT 표시 여부' })
  isVatView: boolean;

  @ApiProperty({ example: false, description: '수면 포함 여부' })
  isSleep: boolean;

  @ApiProperty({ example: true, description: '노출 여부' })
  isDisplay: boolean;

  @ApiProperty({ example: true, description: '사용 여부' })
  isActive: boolean;

  @ApiProperty({ example: 30, description: '멤버십 기간 (일)', required: false })
  membershipPeriod: number;

  @ApiProperty({ example: 100000, description: '멤버십 선불금액', required: false })
  membershipPrepayment: number;

  @ApiProperty({ example: 50000, description: '멤버십 추가 선불금액', required: false })
  membershipAddPrepayment: number;

  @ApiProperty({ example: 1, description: '적용 멤버십 시작 등급 ID', required: false })
  membershipStartGradeId: number;

  @ApiProperty({ example: 1, description: '연결 시술설명 ID (OperationInfo)', nullable: true })
  operationInfoId: number | null;

  @ApiProperty({ example: '리프팅 시술 설명', description: '연결 시술설명 타이틀 (요청 언어)', nullable: true })
  operationInfoTitle: string | null;

  @ApiProperty({ description: '메뉴판 분류 목록', type: [ProductMenuBoardListResDto] })
  menuBoardList: ProductMenuBoardListResDto[];

  @ApiProperty({ description: '이미지 목록', type: ImageResDto })
  image: ImageResDto | null;

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

  @ApiProperty({ description: '이미지 정보', type: ImageResDto })
  image: ImageResDto | null;

  @ApiProperty({ example: 'IMG001', description: 'origin 이미지 ID', required: false })
  originImage: ImageResDto | null;


  @ApiProperty({ type: [GetProductTranslationNotMatchKeyResDto], description: '불일치 필드 목록' })
  notMatchKeys: GetProductTranslationNotMatchKeyResDto[];
}

export class GetProductListResDto {
  @ApiProperty({ example: 1, description: '상품 ID' })
  id: number;

  @ApiProperty({ example: 'PR001', description: '상품 코드' })
  code: string;

  @ApiProperty({ example: '대분류명', description: '대분류명', required: false })
  mainCategoryName: string;

  @ApiProperty({ example: '중분류명', description: '중분류명', required: false })
  subCategoryName: string;

  @ApiProperty({ example: ProductType.single, description: '상품 타입', enum: ProductType })
  productType: ProductType;

  @ApiProperty({ example: '상품명', description: '상품명 (요청 언어)' })
  name: string;

  @ApiProperty({ example: [ActiveTarget.crm, ActiveTarget.web], description: '노출 영역', enum: ActiveTarget, isArray: true })
  activeTarget: ActiveTarget[];

  @ApiProperty({ example: 100000, description: '상품 금액' })
  productPrice: number;

  @ApiProperty({ example: true, description: '과세 여부' })
  isTaxIncluded: boolean;

  @ApiProperty({ example: true, description: 'VAT 표시 여부' })
  isVatView: boolean;

  @ApiProperty({ example: ['ko', 'en'], description: '미입력 언어', enum: Language, isArray: true })
  notInputLanguages: Language[];

  @ApiProperty({ example: true, description: '사용 여부' })
  isActive: boolean;

  @ApiProperty({ example: '2026-01-01', description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01', description: '수정일시' })
  updatedAt: Date;
}
