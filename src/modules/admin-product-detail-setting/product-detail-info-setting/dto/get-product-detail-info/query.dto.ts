import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Language } from '@prisma/client';
import { PaginationReqDto } from '@common/dto/pagination.dto';

export class GetProductDetailInfoListReqDto extends PaginationReqDto {
  @ApiProperty({ description: '상세페이지 설명 타이틀 검색', example: '필러', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: '미입력 언어', example: 'ko', enum: Language, required: false })
  @IsEnum(Language)
  @IsOptional()
  notInputLanguage?: Language;

  @ApiProperty({ description: '해시태그 검색', example: '필러', required: false })
  @IsString()
  @IsOptional()
  hashtag?: string;
}
