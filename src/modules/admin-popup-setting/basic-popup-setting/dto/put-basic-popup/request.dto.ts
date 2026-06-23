import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PutBasicPopupReqDto {
  @ApiProperty({ description: '시작일', example: '2026-01-01', required: true })
  @IsString()
  @IsNotEmpty({ message: 'basic-popup.startAt.required' })
  startAt: string;

  @ApiProperty({ description: '시작시간', example: '09:00', required: true })
  @IsString()
  @IsNotEmpty({ message: 'basic-popup.startTime.required' })
  startTime: string;

  @ApiProperty({ description: '종료일', example: '2026-12-31', required: true })
  @IsString()
  @IsNotEmpty({ message: 'basic-popup.endAt.required' })
  endAt: string;

  @ApiProperty({ description: '종료시간', example: '18:00', required: true })
  @IsString()
  @IsNotEmpty({ message: 'basic-popup.endTime.required' })
  endTime: string;

  @ApiProperty({ type: 'string', format: 'binary', description: '이미지 파일', required: false })
  @IsOptional()
  file?: Express.Multer.File;
}
