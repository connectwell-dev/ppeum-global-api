import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationReqDto } from '@common/dto/pagination.dto';
import { Transform } from 'class-transformer';
import { GeneralImageType } from '@prisma/client';

export class GetImageListQueryDto extends PaginationReqDto {
  @ApiProperty({ description: '이미지 분류 ID', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : undefined))
  categoryId?: number;

  @ApiProperty({ description: '이미지 분류 타입', example: 'product', required: false, enum: GeneralImageType })
  @IsOptional()
  @IsEnum(GeneralImageType)
  type?: GeneralImageType;


  @ApiProperty({ description: '이미지 ID (완전 일치)', example: 'IMG123456', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: '이미지 명 (부분 일치)', example: '메인', required: false })
  @IsOptional()
  @IsString()
  name?: string;
}
