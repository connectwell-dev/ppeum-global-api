import { ApiProperty } from '@nestjs/swagger';

export class GetProductCategoryProductListResDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'PR69966E8C30DAC' })
  code: string;

  @ApiProperty({ example: '분류 명' })
  categoryName: string;

  @ApiProperty({ example: '상품 명' })
  name: string;
}
