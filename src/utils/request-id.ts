import { Context } from 'koa';
import crypto from 'crypto';

const REQUEST_ID_KEY = 'X-Request-Id';
const SERVICE_NAME = process.env.SERVICE_NAME || 'nss-ssg-server';

/**
 * 生成请求 ID
 * 格式: {SERVICE_NAME}-{uuid}
 * 例如: ssg-550e8400-e29b-41d4-a716-446655440000
 * @returns 唯一的请求 ID
 */
export function generateRequestId(): string {
  return `${SERVICE_NAME}-${crypto.randomUUID()}`;
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