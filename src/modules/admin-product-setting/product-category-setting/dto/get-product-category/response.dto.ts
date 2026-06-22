import { ApiProperty } from '@nestjs/swagger';

export class ProductCategoryTranslationResDto {
  @ApiProperty({ example: 'ja', description: '언어' })
  language: string;

  @ApiProperty({ example: '분류명', description: '분류명' })
  name: string;
}

export class GetProductCategoryMainListResDto {
  @ApiProperty({ example: 1, description: '대분류 ID' })
  id: number;

  @ApiProperty({ example: 1, description: '노출 순서' })
  order: number;

  @ApiProperty({ example: true, description: '사용 여부' })
  isActive: boolean;

  @ApiProperty({ example: '대분류 명', description: '대분류 명' })
  name: string;

}

export class GetProductCategorySubListResDto {
  @ApiProperty({ example: 1, description: '중분류 ID' })
  id: number;

  @ApiProperty({ example: 1, description: '대분류 ID' })
  parentId: number;

  @ApiProperty({ example: 1, description: '노출 순서' })
  order: number;

  @ApiProperty({ example: true, description: '사용 여부' })
  isActive: boolean;

  @ApiProperty({ example: '중분류 명', description: '중분류 명' })
  name: string;
}
