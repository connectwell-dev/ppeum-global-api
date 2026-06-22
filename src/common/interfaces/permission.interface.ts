export interface AdminPermissionInterface {
  visitorSetting: boolean;              // 고객 설정
  visitorInfoSetting: boolean;          // 고객 정보 관리
  sellMenuSetting: boolean;             // 진료상품 설정
  hospitalSetting: boolean;             // 병원 설정
  employeeSetting: boolean;             // 직원 설정
  generalSetting: boolean;              // 기타 설정
  paymentSetting: boolean;              // 결제 설정
  penchartSetting: boolean;             // 팬차트 설정
  notificationChannelSetting: boolean; // 문자,메일,알림톡 설정
  logSetting: boolean;                 // 이력 관리
}

export interface UserPermissionInterface {
  reservation: {
    lock: boolean;               // 예약 잠금 권한
    viewAll: boolean;            // 전체 예약실 조회
    viewList: boolean;           // 예약목록 조회 권한
  };
  remainingTreatment: {          // 잔여시술(수동등록)
    create: boolean;             // 등록
    update: boolean;             // 수정
    delete: boolean;             // 삭제
  };
  mileage: {                     // 마일리지(수동등록)
    create: boolean;             // 등록
    update: boolean;             // 수정
    delete: boolean;             // 삭제
  };
  payment: {                     // 결제
    update: boolean;             // 수정
    delete: boolean;             // 삭제
    refundCancel: boolean;       // 상품 환불 취소
  };
  visitorMerge: {               // 고객 병합
    merge: boolean;              // 병합
  };
  penChart: {                    // 펜차트
    delete: boolean;             // 삭제
  };
  medicalCertificate: {          // 진료확인서
    upsert: boolean;             // 등록/수정
    delete: boolean;             // 삭제
  };
  prescription: {                // 처방전
    upsert: boolean;             // 등록/수정
    delete: boolean;             // 삭제
  };
  documentIssuance: {            // 서류 발급
    issue: boolean;              // 발급
    delete: boolean;             // 삭제
  };
  paymentStatus: {               // 결제현황
    view: boolean;               // 조회
  };
  offSetting: {                  // 오프 설정
    update: boolean;             // 변경
  };
  dashboard: {
    viewAll: boolean; // 조회
    directorTreatmentStats: boolean; // 원장 시술 통계
  };
}

export interface JwtPayload {
  id: number;
  loginId: string;
  name: string;
  platform: string;
  sessionId: string;
  permission: AdminPermissionInterface | UserPermissionInterface;
  iat: number;
  exp: number;
}

export const DEFAULT_ADMIN_PERMISSION: AdminPermissionInterface = {
  visitorSetting: false,
  visitorInfoSetting: false,
  sellMenuSetting: false,
  hospitalSetting: false,
  employeeSetting: false,
  generalSetting: false,
  paymentSetting: false,
  penchartSetting: false,
  notificationChannelSetting: false,
  logSetting: false
};

export const DEFAULT_FRONT_PERMISSION: UserPermissionInterface = {
  reservation: { lock: false, viewAll: false, viewList: false },
  remainingTreatment: { create: false, update: false, delete: false },
  mileage: { create: false, update: false, delete: false },
  payment: { update: false, delete: false, refundCancel: false },
  visitorMerge: { merge: false },
  penChart: { delete: false },
  medicalCertificate: { upsert: false, delete: false },
  prescription: { upsert: false, delete: false },
  documentIssuance: { issue: false, delete: false },
  dashboard: { viewAll: false, directorTreatmentStats: false },
  paymentStatus: { view: false },
  offSetting: { update: false },
};

/* 
* -------------- Doctor
*/
export const DOCTOR_ADMIN_PERMISSION: AdminPermissionInterface = {
  visitorSetting: false,
  visitorInfoSetting: false,
  sellMenuSetting: false,
  hospitalSetting: false,
  employeeSetting: false,
  generalSetting: false,
  paymentSetting: false,
  penchartSetting: false,
  notificationChannelSetting: false,
  logSetting: false
};

export const DOCTOR_FRONT_PERMISSION: UserPermissionInterface = {
  reservation: { lock: false, viewAll: false, viewList: false },
  remainingTreatment: { create: false, update: false, delete: false },
  mileage: { create: false, update: false, delete: false },
  payment: { update: false, delete: false, refundCancel: false },
  visitorMerge: { merge: false },
  penChart: { delete: false },
  medicalCertificate: { upsert: true, delete: true },
  prescription: { upsert: false, delete: false },
  documentIssuance: { issue: true, delete: true },
  dashboard: { viewAll: false, directorTreatmentStats: true },
  paymentStatus: { view: false },
  offSetting: { update: false },
};

/* 
* -------------- Consultant
*/
export const CONSULTANT_ADMIN_PERMISSION: AdminPermissionInterface = {
  visitorSetting: false,
  visitorInfoSetting: true,
  sellMenuSetting: false,
  hospitalSetting: false,
  employeeSetting: false,
  generalSetting: false,
  paymentSetting: true,
  penchartSetting: false,
  notificationChannelSetting: false,
  logSetting: false
};

export const CONSULTANT_FRONT_PERMISSION: UserPermissionInterface = {
  reservation: { lock: false, viewAll: false, viewList: false },
  remainingTreatment: { create: false, update: false, delete: false },
  mileage: { create: true, update: true, delete: true },
  payment: { update: false, delete: false, refundCancel: false },
  visitorMerge: { merge: false },
  penChart: { delete: false },
  medicalCertificate: { upsert: true, delete: true },
  prescription: { upsert: false, delete: false },
  documentIssuance: { issue: true, delete: false },
  dashboard: { viewAll: false, directorTreatmentStats: false },
  paymentStatus: { view: false },
  offSetting: { update: false },
};
/**
 * 의사 : Admin 모두 가능 / Front 서류발급(전체), 처방전(전체), 대시보드 내 원장 시술 통계
 * 상담사 : Admin 고객 정보 관리, 수납/결제 관리 / Front 마일리지(수동 등록), 수정, 삭제
 * 코디,간호,관리사,직원 : Admin Front 모두 불가
 */