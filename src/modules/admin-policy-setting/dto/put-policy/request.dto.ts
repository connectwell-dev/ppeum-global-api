import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PutPolicyReqDto {
  @ApiProperty({ description: '내용', example: '이용약관 내용입니다.', required: true })
  @IsString()
  @IsNotEmpty({ message: 'policy.note.required' })
  note: string;
}
