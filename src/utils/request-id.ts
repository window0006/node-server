import { Context } from 'koa';
import { customAlphabet } from 'nanoid';

const REQUEST_ID_KEY = 'X-Request-Id';
const SERVICE_NAME = process.env.SERVICE_NAME || 'ssg';
const nanoid = customAlphabet('1234567890abcdef', 16);

/**
 * 生成请求 ID
 * 格式: {SERVICE_NAME}-{timestamp}-{random}
 * 例如: ssg-1684481234567-a1b2c3d4e5f6
 */
export function generateRequestId(): string {
  return `${SERVICE_NAME}-${Date.now()}-${nanoid()}`;
}

/**
 * 从 Koa Context 中获取请求 ID
 * 如果不存在则返回 undefined
 */
export function getRequestId(ctx: Context): string | undefined {
  return ctx.state.requestId;
}

/**
 * 从 Koa Context 中获取请求 ID
 * 如果不存在则生成一个新的
 */
export function getOrGenerateRequestId(ctx: Context): string {
  if (!ctx.state.requestId) {
    ctx.state.requestId = generateRequestId();
  }
  return ctx.state.requestId;
} 