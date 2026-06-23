import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiCommonResponse } from '@common/dto/common-response.dto';
import { Public } from '@common/decorators/public.decorator';
import { HospitalClosedDateSettingService } from './hospital-closed-date-setting.service';
import { GetClosedDateListResDto, GetClosedDateDetailResDto } from './dto/get-hospital-closed-date/response.dto';
import { SetHospitalClosedDateReqDto } from './dto/set-hospital-closed-date/request.dto';

@Public()
@ApiExtraModels(GetClosedDateListResDto, GetClosedDateDetailResDto)
@ApiTags('H 병원 예약 설정 > 일별 휴진시간')
@Controller('/api/v1/hospital-reservation/closed-date')
export class HospitalClosedDateSettingController {
  constructor(private readonly hospitalClosedDateSettingService: HospitalClosedDateSettingService) { }

  @Get('/list')
  @ApiOperation({ summary: '월별 휴진 날짜 목록 조회' })
  @ApiQuery({ name: 'year', type: Number, example: 2026 })
  @ApiQuery({ name: 'month', type: Number, example: 6 })
  @ApiCommonResponse(GetClosedDateListResDto, { status: 200 })
  async getClosedDateList(@Query('year') year: number, @Query('month') month: number) {
    return await this.hospitalClosedDateSettingService.getClosedDateList(+year, +month);
  }

  @Get('/detail')
  @ApiOperation({ summary: '일별 휴진 시간 상세 조회' })
  @ApiQuery({ name: 'date', type: String, example: '2026-06-13' })
  @ApiCommonResponse(GetClosedDateDetailResDto, { status: 200 })
  async getClosedDateDetail(@Query('date') date: string) {
    return await this.hospitalClosedDateSettingService.getClosedDateDetail(date);
  }

  @Post()
  @ApiOperation({ summary: '일별 휴진 시간 등록/수정' })
  async setClosedDate(@Body() dto: SetHospitalClosedDateReqDto) {
    return await this.hospitalClosedDateSettingService.setClosedDate(dto);
  }
}
