import { ApiProperty, ApiResponse, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { Type, applyDecorators } from '@nestjs/common';
import { ReferenceObject, SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { IsOptional } from 'class-validator';

type Options = {
  errorMessage: string;
  field: string;
};

// 공통 설정 응답 클래스
export class CommonSetResponseDto {
  @ApiProperty({ description: 'ID', example: 'number or string' })
  id: number | string; // 설정 응답 클래스의 타입 정의
}

// 오버로딩된 함수 정의
export function ApiCommonResponse<TModel extends Type<any>>(model: TModel, options?: { isArray?: boolean; status?: number; description?: string; example?: any }): ReturnType<typeof applyDecorators>;
export function ApiCommonResponse(model: SchemaObject & Partial<ReferenceObject>, options?: { isArray?: boolean; status?: number; description?: string; example?: any }): ReturnType<typeof applyDecorators>;

// 구현부
export function ApiCommonResponse<TModel extends Type<any>>(model: TModel | (SchemaObject & Partial<ReferenceObject>), options?: { isArray?: boolean; status?: number; description?: string; example?: any }) {
  const isArray = options?.isArray || false;
  const status = options?.status || 200;
  const description = options?.description || '';

  // 기본 타입들 (String, Number, Boolean) 처리 추가
  if (model === String || model === Number || model === Boolean) {
    const typeMap = {
      [String as any]: 'string',
      [Number as any]: 'number',
      [Boolean as any]: 'boolean',
    };

    return applyDecorators(
      ApiResponse({
        status,
        description: description,
        schema: {
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: isArray
              ? {
                type: 'array',
                items: {
                  type: typeMap[model as any],
                  example: options?.example || (model === String ? '' : model === Number ? 0 : true),
                },
              }
              : {
                type: typeMap[model as any],
                example: options?.example || (model === String ? '' : model === Number ? 0 : true),
              },
          },
        },
      }),
    );
  }
  // 빈 객체나 null 처리
  if (!model || (typeof model === 'object' && Object.keys(model).length === 0)) {
    return applyDecorators(
      ApiResponse({
        status,
        description: description,
        schema: {
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: isArray
              ? {
                type: 'array',
                items: { type: 'object' },
                example: [],
              }
              : {
                type: 'object',
                example: {},
              },
          },
        },
      }),
    );
  }

  // 클래스인 경우
  if (typeof model === 'function') {
    return applyDecorators(
      ApiResponse({
        status,
        description: description,
        schema: {
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: isArray
              ? {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              }
              : { $ref: getSchemaPath(model) },
          },
        },
      }),
    );
  }

  // 스키마 객체인 경우
  return applyDecorators(
    ApiResponse({
      status,
      description: description,
      schema: {
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: isArray
            ? {
              type: 'array',
              items: { ...model },
            }
            : { ...model },
        },
      },
    }),
  );
}

export class ErrorResponseDto {
  @ApiProperty({ example: 'BAD_REQUEST_ERROR' })
  code: string;

  @ApiProperty({ example: '실패 메세지' })
  message: string;

  @ApiProperty({
    example: {
      errorMessage: '에러 메세지',
      field: '에러필드',
    },
  })
  @IsOptional()
  options: Options;
}

