import { Type as NestType, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiProperty, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * 페이징 처리 전용 Response Dto set
 */

export interface PaginatedResponseDto<T> {
  total: number;
  page: number;
  totalPage: number;
  data: T[];
}

export function ApiPaginatedResponse<T extends NestType<any>>(
  dataDto: T,
  options?: { status?: number },
) {
  const status = options?.status ?? 200;
  return applyDecorators(
    ApiExtraModels(dataDto),
    ApiResponse({
      status,
      schema: {
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              total: { type: 'number', example: 10, description: '전체 갯수' },
              page: { type: 'number', example: 1, description: '현재 페이지' },
              totalPage: { type: 'number', example: 10, description: '전체 페이지' },
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(dataDto) },
                description: '리스트',
              },
            },
          },
        },
      },
    }),
  );
}

/**
 * 실제 생성 dto
 */
export function createPaginatedResponseDto<T>(
  dataType: () => NestType<T>,
  description: string,
  schemaName: string,
) {
  class PaginatedResDto {
    @ApiProperty({ description: '전체 갯수', example: 10 })
    total: number;

    @ApiProperty({ description: '현재 페이지', example: 1 })
    page: number;

    @ApiProperty({ description: '전체 페이지', example: 10 })
    totalPage: number;

    @ApiProperty({
      description,
      type: dataType,
      isArray: true,
    })
    data: T[];
  }
  Object.defineProperty(PaginatedResDto, 'name', { value: schemaName });
  return PaginatedResDto;
}

/**
 * 리스트 조회 페이징 Request Dto (공통)
 */
export class PaginationReqDto {
  @ApiProperty({ description: '페이지', example: 1, required: true })
  @IsNotEmpty({ message: 'visitor.page.required', context: { messageDetail: '페이지는 필수 입력 값입니다.' } })
  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => {
    const num = value === undefined || value === null ? 1 : Number(value);
    return num === 0 ? 1 : num;
  })
  page: number;

  @ApiProperty({ description: '페이지당 갯수', example: 10, required: true })
  @IsNotEmpty({ message: 'visitor.rowCount.required', context: { messageDetail: '페이지당 갯수는 필수 입력 값입니다.' } })
  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => {
    const num = value === undefined || value === null ? 10 : Number(value);
    return num;
  })
  rowCount: number;

  @ApiProperty({ description: '정렬 필드', example: 'createdAt', required: false })
  @IsString()
  @IsOptional()
  sort?: string;

  @ApiProperty({ description: '정렬 방향', example: 'desc', required: false })
  @IsString()
  @IsOptional()
  order?: string;
}
