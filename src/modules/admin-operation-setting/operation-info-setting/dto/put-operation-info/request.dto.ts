import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Language } from '@prisma/client';
import { SetOperationInfoDefaultTranslationDto, SetOperationInfoTranslationDto } from '../set-operation-info/request.dto';

// 기준언어(ja) 수정 - title, description 필수
export class PutOperationInfoReqDto extends SetOperationInfoDefaultTranslationDto {
  @ApiProperty({ description: '단순변경 여부 (false 시 타 언어 재번역 대상으로 지정)', example: false })
  @IsBoolean()
  @IsNotEmpty()
  isSimpleChange: boolean;
}

// 공용언어(ko) 번역 수정 - 전체 옵션
export class PutOperationInfoPublicTranslationReqDto extends SetOperationInfoTranslationDto {

  @ApiProperty({ description: '단순변경 여부', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isSimpleChange?: boolean;
}

// 기타언어 번역 수정 - 전체 옵션
export class PutOperationInfoTranslationReqDto extends SetOperationInfoTranslationDto {
  @ApiProperty({ description: '언어', example: 'en', enum: Language })
  @IsEnum(Language)
  @IsNotEmpty()
  language: Language;
}
