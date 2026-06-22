import { AUTH_ERROR_MESSAGE } from './auth.error';
import { COMMON_ERROR_MESSAGE } from './common.error';
import { EMPLOYEE_ERROR_MESSAGE } from './employee.error';
import { GENERAL_ERROR_MESSAGE } from './general.error';
import { OPERATION_ERROR_MESSAGE } from './operation.error';
import { PRODUCT_ERROR_MESSAGE } from './product.error';

export const ERROR_MESSAGE = {
  ...AUTH_ERROR_MESSAGE,
  ...COMMON_ERROR_MESSAGE,
  ...EMPLOYEE_ERROR_MESSAGE,
  ...GENERAL_ERROR_MESSAGE,
  ...OPERATION_ERROR_MESSAGE,
  ...PRODUCT_ERROR_MESSAGE,
};

export type ErrorMessageKey = keyof typeof ERROR_MESSAGE;
