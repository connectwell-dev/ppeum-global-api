// SubOrder처럼 추가 필드가 필요한 경우
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsBoolean, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Language } from '@prisma/client';


export class UpdateOrderReqDto {
  @ApiProperty({ description: '변경 노출 순위', example: 5 })
  @IsNotEmpty({ message: 'visitor.order.required', context: { messageDetail: '변경 노출 순위는 필수 입력 값입니다.' } })
  @IsNumber()
  @Type(() => Number)
  order: number;
}

export class UpdatePriorityReqDto {
  @ApiProperty({ description: '변경 노출 우선순위', example: 5 })
  @IsNotEmpty({ message: 'common.priority.required', context: { messageDetail: '변경 노출 우선순위는 필수 입력 값입니다.' } })
  @IsNumber()
  @Type(() => Number)
  priority: number;
}

export class UpdateToggleReqDto {
  @ApiProperty({ description: '변경 상태', example: true })
  @IsNotEmpty({ message: 'visitor.isActive.required', context: { messageDetail: '변경 상태는 필수 입력 값입니다.' } })
  @IsBoolean()
  @Type(() => Boolean)
  isActive: boolean;
}

export class LanguageReqDto {
  @ApiProperty({ example: 'ko' })
  @IsString()
  @IsNotEmpty()
  language: Language;
}