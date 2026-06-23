import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonResponse } from '@common/dto/common-response.dto';
import { Public } from '@common/decorators/public.decorator';
import { AdminPermission } from '@common/decorators/permission.decorator';
import { HospitalReservationSettingService } from './hospital-reservation-setting.service';
import { GetHospitalWeeklyWorkTimeResDto } from './dto/get-hospital-reservation/response.dto';
import { SetHospitalWeeklyWorkTimeReqDto } from './dto/set-hospital-reservation/request.dto';

@Public()
@ApiExtraModels(GetHospitalWeeklyWorkTimeResDto)
@ApiTags('H 병원 예약 설정 > 진료시간')
@Controller('/api/v1/hospital-reservation')
export class HospitalReservationSettingController {
  constructor(private readonly hospitalReservationSettingService: HospitalReservationSettingService) { }

  @Get('/weekly-work-time')
  @ApiOperation({ summary: '요일별 진료시간 조회' })
  @ApiCommonResponse(GetHospitalWeeklyWorkTimeResDto, { status: 200 })
  async getHospitalWeeklyWorkTime() {
    return await this.hospitalReservationSettingService.getHospitalWeeklyWorkTime();
  }

  @Post('/weekly-work-time')
  @ApiOperation({ summary: '요일별 진료시간 등록/수정' })
  async setHospitalWeeklyWorkTime(@Body() dto: SetHospitalWeeklyWorkTimeReqDto) {
    return await this.hospitalReservationSettingService.setHospitalWeeklyWorkTime(dto);
  }
}
