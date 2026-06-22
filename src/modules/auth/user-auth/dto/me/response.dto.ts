import { ApiProperty } from '@nestjs/swagger';
import { EmployeeType, EmploymentStatus, Platform } from '@prisma/client';

export class GetUserMeResDto {
  @ApiProperty({ description: '직원 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '로그인 ID', example: 'consultant01' })
  loginId: string;

  @ApiProperty({ description: '이름', example: '홍상담' })
  name: string;

  @ApiProperty({ description: '직책', enum: EmployeeType, example: EmployeeType.consultant })
  employeeType: EmployeeType;

  @ApiProperty({ description: '재직 상태', enum: EmploymentStatus, example: EmploymentStatus.working })
  employmentStatus: EmploymentStatus;

  @ApiProperty({ description: '플랫폼 (JWT platform claim)', enum: Platform, example: Platform.CRM })
  platform: Platform;

  @ApiProperty({ description: '직급 ID (EmployeeDeptRank.id, depth=1)', example: 12, nullable: true })
  rankId: number | null;

  @ApiProperty({ description: '직급명 (EmployeeDeptRank.name)', example: '대리', nullable: true })
  rankName: string | null;

  @ApiProperty({ description: '부서명 (EmployeeDeptRank.parent.name, depth=0)', example: '상담팀', nullable: true })
  deptName: string | null;

  @ApiProperty({ description: '이메일', example: 'consultant@hospital.com', nullable: true })
  email: string | null;

  @ApiProperty({ description: '전화번호', example: '010-1234-5678', nullable: true })
  phoneNumber: string | null;

  @ApiProperty({ description: '비밀번호 초기화 필요 여부', example: false })
  isResetPassword: boolean;

  @ApiProperty({
    description: '사용자 권한 (UserPermissionInterface)',
    example: { reservation: { lock: false, viewAll: true, viewList: true } },
  })
  permission: Record<string, unknown>;
}
