import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EmptyToCustomValue } from '@common/decorators/empty-to-custom-value';
import { ActiveTarget, ProductType, Language } from '@prisma/client';

export class SetProductTranslationDto {
  @ApiProperty({ description: '언어', example: 'ko', enum: Language })
  @IsEnum(Language)
  @IsNotEmpty()
  language: Language;

  @ApiProperty({ description: '상품명', example: '상품명', required: false })
  @IsOptional()
  @IsString()
  @EmptyToCustomValue()
  name?: string;

  @ApiProperty({ description: '상품 설명', example: '상품 설명', required: false })
  @IsOptional()
  @IsString()
  @EmptyToCustomValue()
  description?: string;

  @ApiProperty({ description: '이미지 Code', example: 'IMG_New_Product', required: false })
  @IsOptional()
  @IsString()
  @EmptyToCustomValue()
  imageCode?: string;
}

export class SetProductReqDto {
  @ApiProperty({ description: '상품 분류 ID (중분류)', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  productCategoryId: number;

  @ApiProperty({ description: '상품 타입', example: ProductType.single, enum: ProductType })
  @IsEnum(ProductType)
  @IsNotEmpty()
  productType: ProductType;

  @ApiProperty({ description: '상품 금액', example: 100000 })
  @IsNumber()
  @IsNotEmpty()
  productPrice: number;

  @ApiProperty({ description: '상품 비고', example: '상품 비고', required: false })
  @IsOptional()
  @IsString()
  productNote?: string;

  @ApiProperty({ description: '노출 대상', example: [ActiveTarget.crm], enum: ActiveTarget, isArray: true })
  @IsArray()
  @IsEnum(ActiveTarget, { each: true })
  activeTarget: ActiveTarget[];


  @ApiProperty({ description: '과세 여부', example: true })
  @IsBoolean()
  @IsNotEmpty()
  isTaxIncluded: boolean;

  @ApiProperty({ description: 'VAT 표시 여부', example: true })
  @IsBoolean()
  @IsNotEmpty()
  isVatView: boolean;

  @ApiProperty({ description: '수면 포함 여부', example: false })
  @IsBoolean()
  @IsNotEmpty()
  isSleep: boolean;

  @ApiProperty({ description: '노출 여부', example: true })
  @IsBoolean()
  @IsNotEmpty()
  isDisplay: boolean;

  @ApiProperty({ description: '사용 여부', example: true })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @ApiProperty({ description: '멤버십 기간 (일)', example: 30, required: false })
  @IsOptional()
  @IsNumber()
  membershipPeriod?: number;

  @ApiProperty({ description: '멤버십 선불금액', example: 100000, required: false })
  @IsOptional()
  @IsNumber()
  membershipPrepayment?: number;

  @ApiProperty({ description: '멤버십 추가 선불금액', example: 50000, required: false })
  @IsOptional()
  @IsNumber()
  membershipAddPrepayment?: number;

  @ApiProperty({ description: '적용 멤버십 시작 등급 ID', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  membershipStartGradeId?: number;

  @ApiProperty({ description: '연결 시술설명 ID (OperationInfo)', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  operationInfoId?: number;

  @ApiProperty({ description: '메뉴판 노출 분류 ID 목록', type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  menuBoardCategoryIds?: number[];

  @ApiProperty({ description: '언어별 상품명 목록', type: [SetProductTranslationDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetProductTranslationDto)
  productTranslations?: SetProductTranslationDto[];
}
