import { ApiProperty } from '@nestjs/swagger';

export class ProductCategoryTranslationResDto {
  @ApiProperty({ example: 'ko', description: '언어' })
  language: string;

  @ApiProperty({ example: '분류명', description: '분류명' })
  name: string;
}

export class GetProductCategoryListResDto {
  @ApiProperty({ example: 1, description: '분류 ID' })
  id: number;

  @ApiProperty({ example: 1, description: '노출 순서' })
  order: number;

  @ApiProperty({ example: true, description: '사용 여부' })
  isActive: boolean;

  @ApiProperty({ example: '분류 명', description: '분류 명 (요청 언어)' })
  name: string;
}
