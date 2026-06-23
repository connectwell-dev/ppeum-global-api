import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class SetHospitalClosedDateReqDto {
  @ApiProperty({ description: '날짜 (YYYY-MM-DD)', example: '2026-06-13', required: true })
  @IsString()
  @IsNotEmpty({ message: 'hospitalDateClosedTime.startDate.required' })
  date: string;

  @ApiProperty({
    description: '휴진 시간 맵 (시간 -> 휴진여부)',
    example: { '10:00': true, '10:30': true, '11:00': false },
    required: true,
  })
  @IsObject()
  @IsNotEmpty({ message: 'hospitalDateClosedTime.closedTime.required' })
  closedTime: Record<string, boolean>;
}
