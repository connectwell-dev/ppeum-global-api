import { ApiProperty } from '@nestjs/swagger';

class ClosedDateListItemResDto {
  @ApiProperty({ description: 'ID', example: 1 })
  id: number;

  @ApiProperty({ description: '날짜', example: '2026-06-13' })
  date: string;
}

export class GetClosedDateListResDto {
  @ApiProperty({ description: '휴진 날짜 목록', type: [ClosedDateListItemResDto] })
  list: ClosedDateListItemResDto[];
}

export class GetClosedDateDetailResDto {
  @ApiProperty({ description: 'ID', example: 1, nullable: true, required: false })
  id?: number;

  @ApiProperty({ description: '날짜', example: '2026-06-13' })
  date: string;

  @ApiProperty({ description: '휴진 시간 맵 (시간 -> 휴진여부)', example: { '10:00': true, '10:30': false }, nullable: true })
  closedTime: Record<string, boolean> | null;
}
