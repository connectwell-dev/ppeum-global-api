import { ApiProperty } from '@nestjs/swagger';

export class GetOperationInfoOperationListResDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '시술 명' })
  name: string;

  @ApiProperty({ example: '시술 분류 명', nullable: true })
  categoryName: string | null;
}
