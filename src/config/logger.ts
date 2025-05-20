import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';
import { ENV } from './env';
import { Context } from 'koa';
import { getRequestId } from '../utils/request-id';
import fs from 'fs';

const LOG_DIR = path.join(__dirname, '../../logs');

// 定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      requestId,
      message,
      ...meta
    });
  })
);

// 创建 transport 配置
const createDailyRotateTransport = (filename: string, level?: string) => {
  return new winston.transports.DailyRotateFile({
    dirname: LOG_DIR,
    filename: `${filename}-%DATE%`,
    extension: '.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d',
    createSymlink: true,
    symlinkName: `${filename}.log`,
    level
  });
};

// 开发环境配置
const devLogger = winston.createLogger({
  level: 'debug',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    createDailyRotateTransport('data'),
    createDailyRotateTransport('error', 'error')
  ]
});

// 生产环境配置
const prodLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    createDailyRotateTransport('data'),
    createDailyRotateTransport('error', 'error')
  ]
});

// 确保日志目录存在
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// 创建基础 logger
const baseLogger = ENV.isProd ? prodLogger : devLogger;

// 创建带有请求上下文的 logger
export function createContextLogger(ctx?: Context) {
  const requestId = ctx ? getRequestId(ctx) : undefined;
  
  return {
    debug: (message: string, meta: object = {}) => {
      baseLogger.debug(message, { ...meta, requestId });
    },
    info: (message: string, meta: object = {}) => {
      baseLogger.info(message, { ...meta, requestId });
    },
    warn: (message: string, meta: object = {}) => {
      baseLogger.warn(message, { ...meta, requestId });
    },
    error: (message: string, meta: object = {}) => {
      baseLogger.error(message, { ...meta, requestId });
    }
  };
}

// 导出默认 logger（不带请求上下文）
export const logger = createContextLogger(); 