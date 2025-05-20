import { Context, Next } from 'koa';
import { jwtService } from '../lib/jwt';

export interface AuthenticatedContext extends Context {
  user?: {
    userId: string;
    [key: string]: any;
  };
}

/**
 * OpenAPI 认证中间件
 * 验证请求头中的 JWT token，并将解码后的用户信息添加到 context 对象中
 */
export const openApiAuth = (excludePaths: string[] = []) => {
  return async (ctx: AuthenticatedContext, next: Next) => {
    try {
      // 检查是否是排除的路径
      if (excludePaths.some(path => ctx.path.startsWith(path))) {
        return await next();
      }

      const authHeader = ctx.get('Authorization');
      
      // 从请求头中提取 token
      const token = jwtService.extractTokenFromHeader(authHeader);
      
      // 验证 token
      const decoded = jwtService.verifyToken(token);
      
      // 将用户信息添加到 context 对象中
      ctx.user = decoded;
      
      await next();
    } catch (error) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: error instanceof Error ? error.message : 'Unauthorized',
        success: false
      };
    }
  };
};

/**
 * 可选的 OpenAPI 认证中间件
 * 如果请求头中有 token，则验证并解析；如果没有，则继续处理请求
 */
export const optionalOpenApiAuth = () => {
  return async (ctx: AuthenticatedContext, next: Next) => {
    try {
      const authHeader = ctx.get('Authorization');
      
      if (!authHeader) {
        return await next();
      }

      const token = jwtService.extractTokenFromHeader(authHeader);
      const decoded = jwtService.verifyToken(token);
      ctx.user = decoded;
      
      await next();
    } catch (error) {
      // 即使 token 无效也继续处理请求
      await next();
    }
  };
};
