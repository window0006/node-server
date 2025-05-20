import { Context, Next } from 'koa';
import { generateRequestId } from '../utils/request-id';

const REQUEST_ID_HEADER = 'X-Request-Id';

/**
 * 请求 ID 中间件
 * 1. 优先从请求头获取请求 ID
 * 2. 如果请求头没有，则生成新的请求 ID
 * 3. 将请求 ID 保存到 ctx.state 中
 * 4. 将请求 ID 添加到响应头中
 */
export function requestId() {
  return async (ctx: Context, next: Next) => {
    // 优先从请求头获取
    const requestId = ctx.get(REQUEST_ID_HEADER) || generateRequestId();
    
    // 保存到 ctx.state
    ctx.state.requestId = requestId;
    
    // 添加到响应头
    ctx.set(REQUEST_ID_HEADER, requestId);

    await next();
  };
} 