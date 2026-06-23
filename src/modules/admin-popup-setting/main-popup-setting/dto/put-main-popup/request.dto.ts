import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PutMainPopupReqDto {
  @ApiProperty({ description: '시작일', example: '2026-01-01', required: true })
  @IsString()
  @IsOptional()
  startAt: string;

  @ApiProperty({ description: '시작시간', example: '09:00', required: true })
  @IsString()
  @IsOptional()
  startTime: string;

  @ApiProperty({ description: '종료일', example: '2026-12-31', required: true })
  @IsString()
  @IsOptional()
  endAt: string;

  @ApiProperty({ description: '종료시간', example: '18:00', required: true })
  @IsString()
  @IsOptional()
  endTime: string;

  @ApiProperty({ description: '타이틀', example: '여름 프로모션', required: true })
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty({ description: '링크', example: 'https://example.com', required: false })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiProperty({ description: '새창 여부', example: 'true', required: false })
  @IsOptional()
  @IsString()
  isNewTab?: string;

  @ApiProperty({ description: '정렬 순서', example: '1', required: false })
  @IsOptional()
  @IsString()
  order?: string;

  @ApiProperty({ type: 'string', format: 'binary', description: '이미지 파일', required: false })
  @IsOptional()
  file?: Express.Multer.File;
}
