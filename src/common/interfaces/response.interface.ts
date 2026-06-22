import { HttpStatus } from '@nestjs/common';
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: keyof typeof HttpStatus;
    message: string;
    options?: { messageDetail?: string; field?: string; filedMessage?: string };
  };
}
