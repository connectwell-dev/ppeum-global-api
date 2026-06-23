import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested, MinLength } from 'class-validator';

import { Type } from 'class-transformer';
import { EmptyToCustomValue } from '@common/decorators/empty-to-custom-value';

export class ShortDescriptionItemDto {
  @ApiProperty({ description: '항목명 (고정값 사용)', example: '麻酔時間', required: false })
  @IsString()
  key: string;

  @ApiProperty({ description: '항목 내용', example: '約30分', required: false })
  @IsString()
  value: string;
}

// 기준언어(ko) - title, description 필수
export class SetProductDetailInfoDefaultTranslationDto {
  @ApiProperty({ description: '타이틀', example: '립 필러' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '상세페이지 설명 1', example: '립 필러는 입술에 필러를 주입하는 시술입니다.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: '상세페이지 설명 2 (key는 고정값 사용)',
    type: [ShortDescriptionItemDto],
    example: [
      { key: '마취시간', value: '약 30분' },
      { key: '시술시간', value: '약 1시간' },
      { key: '회복기간', value: '약 1주일' },
      { key: '유지시간', value: '약 6개월' },
      { key: '재시술주기', value: '약 1년' },
    ],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ShortDescriptionItemDto)
  @EmptyToCustomValue()
  shortDescription?: ShortDescriptionItemDto[];

  @ApiProperty({ description: '이미지 code', example: 'IMG_Lip_Filler', required: false })
  @IsString()
  @IsOptional()
  @EmptyToCustomValue()
  imageCode?: string;

  @ApiProperty({ description: '해시태그', example: ['필러', '리프팅'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  @EmptyToCustomValue([])
  hashtag?: string[];

  @ApiProperty({ description: '주의사항', example: ['시술 후 2~3시간 동안 세안을 하지 말아 주세요.'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  @EmptyToCustomValue([])
  caution?: string[];

  @ApiProperty({ description: '비고', example: '영어 검수 필요', required: false })
  @IsString()
  @IsOptional()
  @EmptyToCustomValue()
  note?: string;
}

// 기타 언어 - 전체 옵션
export class SetProductDetailInfoTranslationDto {
  @ApiProperty({ description: '타이틀', example: 'Lip Filler', required: false })
  @IsString()
  @IsOptional()
  @EmptyToCustomValue()
  title?: string;

  @ApiProperty({ description: '상세페이지 설명 1', example: 'Lip filler is...', required: false })
  @IsString()
  @IsOptional()
  @EmptyToCustomValue()
  description?: string;

  @ApiProperty({
    description: '상세페이지 설명 2 (ko: 마취시간/시술시간/회복기간/유지시간/재시술주기, en: 麻醉时间/手术时间/恢复期/持续时间/再手术周期, zhCN 동일, zhTW: 麻醉時間/手術時間/回復期間/持續時間/再手術周期, th/vi/ru 각 언어 고정값 사용)',
    type: [ShortDescriptionItemDto],
    example: [
      { key: '마취시간', value: '약 30분' },
      { key: '시술시간', value: '약 1시간' },
      { key: '회복기간', value: '약 1주일' },
      { key: '유지시간', value: '약 6개월' },
      { key: '재시술주기', value: '약 1년' },
    ],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ShortDescriptionItemDto)
  @EmptyToCustomValue()
  shortDescription?: ShortDescriptionItemDto[];

  @ApiProperty({ description: '이미지 Code', example: 'IMG_Lip_Filler', required: false })
  @IsString()
  @IsOptional()
  @EmptyToCustomValue()
  imageCode?: string;

  @ApiProperty({ description: '해시태그', example: ['filler'], type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @EmptyToCustomValue()
  hashtag?: string[];

  @ApiProperty({ description: '주의사항', example: ['Do not wash face for 2~3 hours.'], type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @EmptyToCustomValue()
  caution?: string[];

  @ApiProperty({ description: '비고', example: 'Need review', required: false })
  @IsString()
  @IsOptional()
  @EmptyToCustomValue()
  note?: string;
}

export class SetProductDetailInfoReqDto {
  @ApiProperty({ description: '기준언어 (ko) - title, description 필수', type: SetProductDetailInfoDefaultTranslationDto })
  @ValidateNested()
  @Type(() => SetProductDetailInfoDefaultTranslationDto)
  ko: SetProductDetailInfoDefaultTranslationDto;

  @ApiProperty({ description: '일본어 (ja)', type: SetProductDetailInfoTranslationDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SetProductDetailInfoTranslationDto)
  ja?: SetProductDetailInfoTranslationDto;

  @ApiProperty({ description: '영어 (en)', type: SetProductDetailInfoTranslationDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SetProductDetailInfoTranslationDto)
  en?: SetProductDetailInfoTranslationDto;

  @ApiProperty({ description: '중국어 간체 (zhCN)', type: SetProductDetailInfoTranslationDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SetProductDetailInfoTranslationDto)
  zhCN?: SetProductDetailInfoTranslationDto;

  @ApiProperty({ description: '중국어 번체 (zhTW)', type: SetProductDetailInfoTranslationDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SetProductDetailInfoTranslationDto)
  zhTW?: SetProductDetailInfoTranslationDto;

  @ApiProperty({ description: '태국어 (th)', type: SetProductDetailInfoTranslationDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SetProductDetailInfoTranslationDto)
  th?: SetProductDetailInfoTranslationDto;

  @ApiProperty({ description: '베트남어 (vi)', type: SetProductDetailInfoTranslationDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SetProductDetailInfoTranslationDto)
  vi?: SetProductDetailInfoTranslationDto;

  @ApiProperty({ description: '러시아어 (ru)', type: SetProductDetailInfoTranslationDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SetProductDetailInfoTranslationDto)
  ru?: SetProductDetailInfoTranslationDto;
}
