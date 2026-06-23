import { Module } from '@nestjs/common';
import { HospitalReservationSettingController } from './hospital-reservation-setting/hospital-reservation-setting.controller';
import { HospitalReservationSettingService } from './hospital-reservation-setting/hospital-reservation-setting.service';
import { HospitalClosedDateSettingController } from './hospital-closed-date-setting/hospital-closed-date-setting.controller';
import { HospitalClosedDateSettingService } from './hospital-closed-date-setting/hospital-closed-date-setting.service';

@Module({
  controllers: [HospitalReservationSettingController, HospitalClosedDateSettingController],
  providers: [HospitalReservationSettingService, HospitalClosedDateSettingService]
})
export class AdminHospitalReservationSettingModule {}
