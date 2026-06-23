import { ApiProperty } from '@nestjs/swagger';

export class GetProductDetailInfoOperationListResDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '상품 명' })
  name: string;

  @ApiProperty({ example: '상품 분류 명', nullable: true })
  categoryName: string | null;
}
