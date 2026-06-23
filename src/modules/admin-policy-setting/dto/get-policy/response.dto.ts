import { ApiProperty } from '@nestjs/swagger';
import { Language, PolicyType } from '@prisma/client';

class PolicyCategoryListItemDto {
  @ApiProperty({ description: '카테고리 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '언어', enum: Language, example: Language.ko })
  language: Language;

  @ApiProperty({ description: '약관 타입', enum: PolicyType, example: PolicyType.terms })
  type: PolicyType;
}

export class GetPolicyCategoryListResDto {
  @ApiProperty({ description: '총 개수', example: 16 })
  total: number;

  @ApiProperty({ description: '약관 카테고리 목록', type: [PolicyCategoryListItemDto] })
  policyCategory: PolicyCategoryListItemDto[];
}

class PolicyItemDto {
  @ApiProperty({ description: '약관 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '내용', example: '이용약관 내용입니다.' })
  note: string;

  @ApiProperty({ description: '생성일시', example: '2026-01-01 00:00:00' })
  createdAt: string;
}

export class GetPolicyCategoryDetailResDto {
  @ApiProperty({ description: '카테고리 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '언어', enum: Language, example: Language.ko })
  language: Language;

  @ApiProperty({ description: '약관 타입', enum: PolicyType, example: PolicyType.terms })
  type: PolicyType;

  @ApiProperty({ description: '약관 목록', type: [PolicyItemDto] })
  policies: PolicyItemDto[];
}
