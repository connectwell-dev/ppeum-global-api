import { ValidationError } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
export const dtoErrorMapping = (validationErrors: ValidationError[]) => {
  // 재귀적으로 모든 ValidationError 추출
  const flattenErrors = (errors: ValidationError[], parentPath = ''): any[] => {
    return errors.flatMap(error => {
      const isIndex = /^\d+$/.test(error.property);
      const currentPath = parentPath
        ? isIndex ? `${parentPath}.${error.property}` : `${parentPath}.${error.property}`
        : error.property;
      // constraints가 있으면 (= leaf 에러) 반환
      if (error.constraints) {
        return Object.entries(error.constraints || {}).map(([key, message]) => {
          let messageDetail = error.contexts?.[key]?.messageDetail || undefined;
          if (!messageDetail) {
            if (key === 'isNotEmpty') messageDetail = `${currentPath}는 필수 입력 값입니다.`;
            else if (key === 'isString') messageDetail = `${currentPath}는 문자열 형식이어야 합니다.`;
            else if (key === 'isNumber') messageDetail = `${currentPath}는 숫자 형식이어야 합니다.`;
            else if (key === 'isInt') messageDetail = `${currentPath}는 정수 형식이어야 합니다.`;
            else if (key === 'isBoolean') messageDetail = `${currentPath}는 불리언 형식이어야 합니다.`;
            else if (key === 'isEnum') messageDetail = `${currentPath}는 열거형 형식이어야 합니다.`;
            else if (key === 'minLength') messageDetail = `${currentPath}의 최소 길이 미만입니다.`;
            else if (key === 'maxLength') messageDetail = `${currentPath}의 최대 길이를 초과 하였습니다.`;
            else if (key === 'isEmail') messageDetail = `${currentPath}는 이메일 형식이어야 합니다.`;
            else if (key === 'isUrl') messageDetail = `${currentPath}는 URL 형식이어야 합니다.`;
            else if (key === 'isDate') messageDetail = `${currentPath}는 날짜 형식이어야 합니다.`;
            else if (key === 'isTime') messageDetail = `${currentPath}는 시간 형식이어야 합니다.`;
            else if (key === 'isDateTime') messageDetail = `${currentPath}는 날짜 시간 형식이어야 합니다.`;
            else if (key === 'isPhoneNumber') messageDetail = `${currentPath}는 전화번호 형식이어야 합니다.`;
            else if (key === 'isZipCode') messageDetail = `${currentPath}는 우편번호 형식이어야 합니다.`;
            else if (key === 'isPostalCode') messageDetail = `${currentPath}는 우편번호 형식이어야 합니다.`;
            else if (key === 'whitelistValidation') messageDetail = `${currentPath}는 허용되지 않는 값입니다.`;
            else if (key === 'matches') messageDetail = `${currentPath}는 형식이 올바르지 않습니다.`;
            else if (
              key === 'roomLocationId' ||
              key === 'roomReservationGroupId' ||
              key === 'roomTreatmentGroupId'
            ) {
              if (typeof message === 'string' && message.includes('.isInt'))
                messageDetail = `${currentPath}는 정수 형식이어야 합니다.`;
              else if (typeof message === 'string' && message.includes('.required'))
                messageDetail = `${currentPath}는 필수 입력 값입니다.`;
              else
                messageDetail = `알 수 없는 에러입니다. constraints key: ${key}, property: ${currentPath}`;
            }
            else messageDetail = `알 수 없는 에러입니다. constraints key: ${key}, property: ${currentPath}`;
          }

          const result = {
            field: currentPath,
            constraint: key,
            message: (message.indexOf('.') === -1) ? 'common.errorMessage' : message,
            options: {
              messageDetail: messageDetail,
              fieldMessage: messageDetail,
              field: currentPath,
            },
          }
          return result;
        });
      }
      // children이 있으면 재귀 호출
      if (error.children && error.children.length > 0) return flattenErrors(error.children, currentPath);
      return [];
    });
  };
  const errors = flattenErrors(validationErrors);
  throw new BadRequestException({
    code: 'VALIDATION_ERROR',
    validationErrors: errors,
  });
}