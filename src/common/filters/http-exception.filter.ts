import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../interfaces/response.interface';
import { ERROR_MESSAGE, ErrorMessageKey } from '../constants/error-message';
import { SettingService } from '@src/core/setting/setting.service';

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly settingService: SettingService) { }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const lang = request.headers['lang'] || this.settingService.getDefaultLanguage();


    let code: keyof typeof HttpStatus = 'INTERNAL_SERVER_ERROR';
    let status = HttpStatus[code];
    let message: string = ERROR_MESSAGE['common.errorMessage'][lang];
    let options: { messageDetail?: string; field?: string; fieldMessage?: string } | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;
      // 404 에러는 간단하게 처리
      if (status === 404) {
        console.log('404 not found (url: ' + ctx.getRequest().url + ')')
        return;
      }
      // ✅ DTO Validation 에러 처리 추가!
      if (status === 400 && exceptionResponse.validationErrors && exceptionResponse.validationErrors.length > 0) {
        // 커스텀 ValidationPipe 에러 형식
        message = ERROR_MESSAGE[exceptionResponse.validationErrors?.[0]?.message as ErrorMessageKey]?.[lang] || ERROR_MESSAGE['common.errorMessage'][lang];
        options = exceptionResponse.validationErrors?.[0]?.options;
        if (options?.fieldMessage) options.fieldMessage = ERROR_MESSAGE[options.fieldMessage as ErrorMessageKey]?.[lang] || ERROR_MESSAGE['common.errorMessage'][lang];
        if (options?.messageDetail) console.log('error messageDetail: ' + options?.messageDetail)
        if (process.env.NODE_ENV === 'production') delete options?.messageDetail;
        const errorResponse: ApiResponse<null> = {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message,
            options: options
          }
        };
        response.status(status).json(errorResponse);
        return
      }
      code = exceptionResponse.code || 'INTERNAL_SERVER_ERROR';
      message = ERROR_MESSAGE[exception.message]?.[lang] || ERROR_MESSAGE['common.errorMessage'][lang];
      options = exceptionResponse.options || undefined;
      if (options?.fieldMessage) options.fieldMessage = ERROR_MESSAGE[options.fieldMessage as ErrorMessageKey]?.[lang] || ERROR_MESSAGE['common.errorMessage'][lang];
      if (options?.messageDetail) console.log('error messageDetail: ' + options?.messageDetail)
      if (process.env.NODE_ENV === 'production') delete options?.messageDetail;
    }
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: {
        code,
        message,
        options,
      },
    };
    response.status(status).json(errorResponse);
  }

}
