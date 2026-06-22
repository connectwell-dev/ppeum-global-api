import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/response.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    let data = next.handle().pipe(
      map((data) => {
        const request = context.switchToHttp().getRequest();
        const newCaToken = request.newCaToken;
        return {
          success: true,
          data,
          ...(newCaToken && { caToken: newCaToken })
        };
      }),
    );
    return data;
  }
}
