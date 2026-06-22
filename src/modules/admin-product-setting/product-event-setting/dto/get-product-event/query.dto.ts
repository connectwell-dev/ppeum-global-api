import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationReqDto } from '@common/dto/pagination.dto';
import { Language, ProductEventType } from '@prisma/client';

export class GetProductEventListReqDto extends PaginationReqDto {
  @ApiProperty({ description: '이벤트 타입', enum: ProductEventType, required: false })
  @IsOptional()
  @IsEnum(ProductEventType)
  eventType?: ProductEventType;

  @ApiProperty({ description: '사용 여부', required: false })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: '이벤트명 검색', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '미입력 언어 필터', enum: Language, required: false })
  @IsOptional()
  @IsEnum(Language)
  notInputLanguage?: Language;
}
