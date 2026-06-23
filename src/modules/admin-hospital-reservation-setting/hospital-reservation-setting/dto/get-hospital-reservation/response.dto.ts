import { ApiProperty } from '@nestjs/swagger';

class TimeRangeResDto {
  @ApiProperty({ description: '시작 시간', example: '09:00' })
  startTime: string;

  @ApiProperty({ description: '종료 시간', example: '18:00' })
  endTime: string;
}

class DayWorkTimeResDto {
  @ApiProperty({ description: 'ID', example: 1, nullable: true })
  id: number | null;

  @ApiProperty({ description: '진료 여부', example: true })
  isTreatment: boolean;

  @ApiProperty({ description: '진료시간', type: TimeRangeResDto, nullable: true })
  weeklyTime: TimeRangeResDto | null;

  @ApiProperty({ description: '점심시간', type: TimeRangeResDto, nullable: true })
  lunchTime: TimeRangeResDto | null;
}

export class GetHospitalWeeklyWorkTimeResDto {
  @ApiProperty({ description: '일요일', type: DayWorkTimeResDto })
  sun: DayWorkTimeResDto;

  @ApiProperty({ description: '월요일', type: DayWorkTimeResDto })
  mon: DayWorkTimeResDto;

  @ApiProperty({ description: '화요일', type: DayWorkTimeResDto })
  tue: DayWorkTimeResDto;

  @ApiProperty({ description: '수요일', type: DayWorkTimeResDto })
  wed: DayWorkTimeResDto;

  @ApiProperty({ description: '목요일', type: DayWorkTimeResDto })
  thu: DayWorkTimeResDto;

  @ApiProperty({ description: '금요일', type: DayWorkTimeResDto })
  fri: DayWorkTimeResDto;

  @ApiProperty({ description: '토요일', type: DayWorkTimeResDto })
  sat: DayWorkTimeResDto;
}
