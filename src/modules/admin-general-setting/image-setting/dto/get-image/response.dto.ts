import { ApiProperty } from '@nestjs/swagger';
import { GeneralImageType } from '@prisma/client';


export class GetImageListResDto {
  @ApiProperty({ description: '이미지 code', example: 'IMG_xxxxxxxx' })
  code: string;

  @ApiProperty({ description: '이미지 명', example: '상품 메인 이미지' })
  name: string;

  @ApiProperty({ description: '이미지 경로', example: 'uuid.jpg' })
  path: string;

  @ApiProperty({ description: '생성일시', example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시', example: '2026-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class GetImageDetailResDto extends GetImageListResDto {

}
