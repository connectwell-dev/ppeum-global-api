import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class SetImageReqDto {
  @ApiProperty({ description: '이미지 분류 ID', example: 1, required: true })
  @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : undefined))
  @IsInt()
  @IsPositive()
  imageCategoryId: number;

  @ApiProperty({ description: '이미지 명', example: '상품 메인 이미지', required: true })
  @IsString()
  @IsNotEmpty({ message: 'image.name.required' })
  @MaxLength(50)
  name: string;

  @ApiProperty({ type: 'string', format: 'binary', description: '이미지 파일 (jpeg, png, gif, webp / 최대 10MB)' })
  @IsOptional()
  file?: Express.Multer.File;
}
