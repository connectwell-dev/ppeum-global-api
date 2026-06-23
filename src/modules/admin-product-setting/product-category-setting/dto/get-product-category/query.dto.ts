import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationReqDto } from '@common/dto/pagination.dto';
import { Language, ProductCategoryType } from '@prisma/client';

export class GetProductCategoryListReqDto extends PaginationReqDto {
  @ApiProperty({ description: '카테고리 타입', enum: ProductCategoryType, required: false })
  @IsOptional()
  @IsEnum(ProductCategoryType)
  categoryType?: ProductCategoryType;

  @ApiProperty({ description: '사용 여부', required: false })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: '카테고리명 검색', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '미입력 언어 필터', enum: Language, required: false })
  @IsOptional()
  @IsEnum(Language)
  notInputLanguage?: Language;
}
