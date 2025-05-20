// 基础错误接口
export interface BaseError extends Error {
  code?: string;          // 错误代码，用于前端识别具体错误类型
  status?: number;        // HTTP 状态码
  details?: unknown;      // 额外的错误详情
}

// HTTP 错误
export class HttpError extends Error implements BaseError {
  constructor(
    message: string,
    public status: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR',
    public details?: unknown
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

// 业务错误
export class BusinessError extends Error implements BaseError {
  constructor(
    message: string,
    public code: string,
    public status: number = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = 'BusinessError';
  }
}

// 验证错误
export class ValidationError extends Error implements BaseError {
  constructor(
    message: string,
    public details: Record<string, string[]>,
    public code: string = 'VALIDATION_ERROR',
    public status: number = 422
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// 数据库错误
export class DatabaseError extends Error implements BaseError {
  constructor(
    message: string,
    public code: string = 'DATABASE_ERROR',
    public status: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
} 