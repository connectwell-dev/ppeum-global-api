import { HttpException } from '@nestjs/common';
import { HttpStatus } from './enums/http-status.enum';

interface CustomExceptionOptions {
  messageDetail?: string;
  field?: string;
  fieldMessage?: string;
}
export class CustomException extends HttpException {
  constructor(message: string = 'common.errorMessage', code: keyof typeof HttpStatus = 'INTERNAL_SERVER_ERROR', options?: CustomExceptionOptions) {
    super(
      {
        message,
        code,
        options,
      },
      HttpStatus[code],
    );
  }
}
