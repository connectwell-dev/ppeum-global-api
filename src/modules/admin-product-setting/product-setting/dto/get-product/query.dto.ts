import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationReqDto } from '@common/dto/pagination.dto';
import { Language } from '@prisma/client';

export class GetProductListReqDto extends PaginationReqDto {
  @ApiProperty({ description: '상품명 검색', example: '상품명', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '미입력 언어 필터', example: 'ko', required: false, enum: Language })
  @IsOptional()
  @IsEnum(Language)
  notInputLanguage?: Language;

  @ApiProperty({ description: '사용 여부', example: true, required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value)
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: '상품 코드', example: 'PR001', required: false })
  @IsOptional()
  @IsString()
  code?: string;
}
