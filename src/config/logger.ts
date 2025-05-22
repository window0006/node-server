import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { ENV } from './env';
import { Context } from 'koa';
import { getRequestId } from '../utils/request-id';
import fs from 'fs';
import process from 'process';

const LOG_DIR = path.join(__dirname, '../../logs');

// 获取进程信息
const PROCESS_NAME = path.basename(process.argv[1]); // 获取进程名
const PROCESS_ID = process.pid.toString();
const PROCESS_INFO = `${PROCESS_NAME}_${PROCESS_ID}`;

/**
 * 从错误堆栈中提取调用信息
 * @returns 返回文件信息和函数名
 */
function getCallerInfo(): { fileInfo: string; functionName: string } {
  const stackTrace = new Error().stack?.split('\n')[4] || '';
  
  // 提取文件信息
  const fileMatch = stackTrace.match(/at (?:.*? \()?([^:]+):(\d+):(\d+)\)?/);
  const fileInfo = fileMatch ? `${path.basename(fileMatch[1])}:${fileMatch[2]}` : 'unknown';
  
  // 提取函数名
  const funcMatch = stackTrace.match(/at (?:async )?([^(\s]+)/);
  const functionName = funcMatch ? funcMatch[1].split('.').pop() || 'anonymous' : 'anonymous';

  return { fileInfo, functionName };
}

// 定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'  // 毫秒级精度
  }),
  winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
    const { fileInfo, functionName } = getCallerInfo();
    const threadId = `0x${(process.hrtime.bigint() % 1000n).toString(16)}`;

    // 组装日志前缀
    const prefix = [
      timestamp,                // 时间戳（毫秒级）
      level.toUpperCase(),     // 日志级别
      PROCESS_INFO,            // 进程信息
      threadId,                // 模拟的线程ID
      fileInfo,                // 文件信息
      functionName,            // 函数名
      requestId || '-',        // 请求ID
    ].join('|');

    // 处理额外的元数据
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    const logMessage = metaStr ? `${message} ${metaStr}` : message;

    return `${prefix}|${logMessage}`;
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
        logFormat
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
  
  const logger = {
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

  return logger;
}

// 导出默认 logger（不带请求上下文）
export const logger = createContextLogger();
