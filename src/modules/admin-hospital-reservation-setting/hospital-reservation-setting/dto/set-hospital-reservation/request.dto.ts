import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, ValidateNested, IsArray } from 'class-validator';

export class TimeRangeDto {
  @ApiProperty({ description: '시작 시간', example: '09:00', required: true })
  @IsString()
  @IsNotEmpty({ message: 'hospitalWeeklyWorkTime.startTime.required' })
  startTime: string;

  @ApiProperty({ description: '종료 시간', example: '18:00', required: true })
  @IsString()
  @IsNotEmpty({ message: 'hospitalWeeklyWorkTime.endTime.required' })
  endTime: string;
}

export class SetHospitalWeeklyWorkTimeItemDto {
  @ApiProperty({ description: '요일', example: 'mon', required: true, enum: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] })
  @IsString()
  @IsNotEmpty({ message: 'hospitalWeeklyWorkTime.weekDayType.required' })
  @IsIn(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'], { message: 'hospitalWeeklyWorkTime.weekDayType.invalid' })
  weekDayType: string;

  @ApiProperty({ description: '진료 여부', example: true, required: true })
  @IsBoolean()
  @IsNotEmpty({ message: 'hospitalWeeklyWorkTime.isTreatment.required' })
  isTreatment: boolean;

  @ApiProperty({ description: '진료시간 (startTime ~ endTime)', type: TimeRangeDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimeRangeDto)
  weeklyTime?: TimeRangeDto;

  @ApiProperty({ description: '점심시간 (startTime ~ endTime)', type: TimeRangeDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimeRangeDto)
  lunchTime?: TimeRangeDto;
}

export class SetHospitalWeeklyWorkTimeReqDto {
  @ApiProperty({
    description: '요일별 진료시간 리스트',
    example: [
      { weekDayType: 'mon', isTreatment: true, weeklyTime: { startTime: '09:00', endTime: '18:00' }, lunchTime: { startTime: '12:00', endTime: '13:00' } },
      { weekDayType: 'tue', isTreatment: true, weeklyTime: { startTime: '09:00', endTime: '18:00' }, lunchTime: { startTime: '12:00', endTime: '13:00' } },
      { weekDayType: 'sun', isTreatment: false },
    ],
    type: [SetHospitalWeeklyWorkTimeItemDto],
    required: true,
  })
  @IsArray()
  @IsNotEmpty({ message: 'hospitalWeeklyWorkTime.data.required' })
  @ValidateNested({ each: true })
  @Type(() => SetHospitalWeeklyWorkTimeItemDto)
  data: SetHospitalWeeklyWorkTimeItemDto[];
}
