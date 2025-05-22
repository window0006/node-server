import { Context, Next } from 'koa';
import { RetCode, ResponseUtil } from '../types/response';
import { ENV } from '../config/env';
import { createContextLogger } from '../config/logger';

/**
 * 全局错误处理中间件
 * 1. 捕获所有未处理的错误
 * 2. 根据错误类型设置合适的返回码
 * 3. 在开发环境下返回详细错误信息
 * 4. 记录错误日志（带请求 ID）
 */
export function errorHandler() {
  return async (ctx: Context, next: Next) => {
    try {
      await next();
    } catch (error: unknown) {
      let retcode: RetCode;
      let message: string;
      let details: unknown;

      if (error instanceof Error) {
        // 根据错误类型设置返回码
        switch (error.name) {
          case 'ValidationError':
            retcode = RetCode.VALIDATION_ERROR;
            break;
          case 'UnauthorizedError':
            retcode = RetCode.UNAUTHORIZED;
            break;
          case 'ForbiddenError':
            retcode = RetCode.PERMISSION_DENIED;
            break;
          case 'NotFoundError':
            retcode = RetCode.RESOURCE_NOT_FOUND;
            break;
          default:
            retcode = RetCode.INTERNAL_SERVER_ERROR;
        }

        message = ENV.isDev ? error.message : 'An error occurred';
        details = ENV.isDev ? error.stack : undefined;
      } else {
        retcode = RetCode.UNKNOWN_ERROR;
        message = ENV.isDev ? String(error) : 'An unknown error occurred';
      }

      // 设置 HTTP 状态码和响应体
      ctx.status = ResponseUtil.getHttpStatus(retcode);
      ctx.body = ResponseUtil.error(retcode, message, details);
      
      // 使用带请求 ID 的 logger
      const logger = createContextLogger(ctx);
      logger.info('Request error', {
        url: ctx.url,
        method: ctx.method,
        retcode,
        message,
        details
      });
    }
  };
} 