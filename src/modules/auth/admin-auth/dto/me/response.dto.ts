import { ApiProperty } from '@nestjs/swagger';
import { EmployeeType, EmploymentStatus, Platform } from '@prisma/client';

export class GetAdminMeResDto {
  @ApiProperty({ description: '직원 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '로그인 ID', example: 'admin01' })
  loginId: string;

  @ApiProperty({ description: '이름', example: '관리자' })
  name: string;

  @ApiProperty({ description: '직책', enum: EmployeeType, example: EmployeeType.super_admin })
  employeeType: EmployeeType;

  @ApiProperty({ description: '재직 상태', enum: EmploymentStatus, example: EmploymentStatus.working })
  employmentStatus: EmploymentStatus;

  @ApiProperty({ description: '플랫폼 (JWT platform claim)', enum: Platform, example: Platform.Admin })
  platform: Platform;

  @ApiProperty({ description: '직급 ID (EmployeeDeptRank.id, depth=1)', example: 12, nullable: true })
  rankId: number | null;

  @ApiProperty({ description: '직급명 (EmployeeDeptRank.name)', example: '대리', nullable: true })
  rankName: string | null;

  @ApiProperty({ description: '부서명 (EmployeeDeptRank.parent.name, depth=0)', example: '경영지원팀', nullable: true })
  deptName: string | null;

  @ApiProperty({ description: '이메일', example: 'admin@hospital.com', nullable: true })
  email: string | null;

  @ApiProperty({ description: '전화번호', example: '010-1234-5678', nullable: true })
  phoneNumber: string | null;

  @ApiProperty({ description: '비밀번호 초기화 필요 여부', example: false })
  isResetPassword: boolean;

  @ApiProperty({
    description: '어드민 권한 (AdminPermissionInterface)',
    example: { visitorSetting: true, employeeSetting: true },
  })
  permission: Record<string, unknown>;
}
