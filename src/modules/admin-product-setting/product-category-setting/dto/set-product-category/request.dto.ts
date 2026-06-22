import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, MaxLength, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductCategoryTranslationDto {
  @ApiProperty({ description: '언어', example: 'ko' })
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiProperty({ description: '분류명', example: '분류명' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}

export class SetProductCategoryReqDto {
  @ApiProperty({ description: '사용 여부', example: true })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @ApiProperty({ description: '언어별 분류명', type: [ProductCategoryTranslationDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ProductCategoryTranslationDto)
  translations: ProductCategoryTranslationDto[];
}
