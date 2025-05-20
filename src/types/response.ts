// HTTP 状态码枚举
export enum HttpStatus {
  SUCCESS = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500
}

// 业务返回码枚举
export enum RetCode {
  SUCCESS = 0,
  // 通用错误码 (1-99)
  UNKNOWN_ERROR = 1,
  VALIDATION_ERROR = 2,
  
  // 认证相关错误码 (100-199)
  UNAUTHORIZED = 100,
  TOKEN_EXPIRED = 101,
  INVALID_TOKEN = 102,
  
  // 权限相关错误码 (200-299)
  PERMISSION_DENIED = 200,
  
  // 资源相关错误码 (300-399)
  RESOURCE_NOT_FOUND = 300,
  RESOURCE_ALREADY_EXISTS = 301,
  
  // 服务端错误码 (500-599)
  INTERNAL_SERVER_ERROR = 500,
  DATABASE_ERROR = 501,
  REMOTE_SERVICE_ERROR = 502
}

// API 响应接口
export interface ApiResponse<T = any> {
  retcode: RetCode;
  data?: T;
  message?: string;
}

// 错误响应接口
export interface ErrorResponse {
  retcode: RetCode;
  message: string;
  details?: unknown;
}

// 响应生成工具类
export class ResponseUtil {
  // 成功响应
  static success<T>(data?: T, message?: string): ApiResponse<T> {
    return {
      retcode: RetCode.SUCCESS,
      data,
      message
    };
  }

  // 错误响应
  static error(
    retcode: RetCode,
    message: string,
    details?: unknown
  ): ErrorResponse {
    return {
      retcode,
      message,
      details
    };
  }

  // 获取对应的 HTTP 状态码
  static getHttpStatus(retcode: RetCode): HttpStatus {
    switch (retcode) {
      case RetCode.SUCCESS:
        return HttpStatus.SUCCESS;
      case RetCode.UNAUTHORIZED:
      case RetCode.TOKEN_EXPIRED:
      case RetCode.INVALID_TOKEN:
        return HttpStatus.UNAUTHORIZED;
      case RetCode.PERMISSION_DENIED:
        return HttpStatus.FORBIDDEN;
      case RetCode.RESOURCE_NOT_FOUND:
        return HttpStatus.NOT_FOUND;
      case RetCode.VALIDATION_ERROR:
        return HttpStatus.BAD_REQUEST;
      case RetCode.INTERNAL_SERVER_ERROR:
      case RetCode.DATABASE_ERROR:
      case RetCode.REMOTE_SERVICE_ERROR:
        return HttpStatus.INTERNAL_ERROR;
      default:
        return HttpStatus.INTERNAL_ERROR;
    }
  }
} 