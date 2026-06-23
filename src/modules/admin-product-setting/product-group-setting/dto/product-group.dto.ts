import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SetProductGroupReqDto {
  @ApiProperty({ description: '분류명', example: '필러 시술' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  name: string;
}

export class GetProductGroupResDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'GRP_20260622_0001', description: '자동생성 분류코드' })
  code: string;

  @ApiProperty({ example: '필러 시술' })
  name: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
