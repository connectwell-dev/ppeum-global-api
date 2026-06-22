import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { GeneralImageType } from '@prisma/client';

export class PutImageCategoryReqDto {
  @ApiProperty({ description: '이미지 분류 명', example: '상품 이미지', required: true })
  @IsString()
  @IsNotEmpty({ message: 'imageCategory.name.required' })
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: '이미지 타입', enum: GeneralImageType, example: GeneralImageType.product, required: false, nullable: true })
  @IsOptional()
  @IsEnum(GeneralImageType)
  type?: GeneralImageType;
}
