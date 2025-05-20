// module-alias/register 会修改 Node.js 的模块加载系统
// 拦截所有的 require() 和 import 调用
// 根据配置的别名规则重写模块路径
import 'module-alias/register';
import { addAliases } from 'module-alias';

// 自动读取 .env 文件中的环境变量
// 将这些变量注入到 process.env 对象中
// 如果环境变量已经存在，不会覆盖已有的值
import 'dotenv/config';

import Koa from 'koa';
import { koaBody } from 'koa-body';
import serve from 'koa-static';
import compress from 'koa-compress';
import path from 'path';
import { constants as zlibConstants } from 'zlib';
import { ENV } from './config/env';
import { logger } from './config/logger';
import router from './router/index';
import { RetCode, ResponseUtil, HttpStatus } from './types/response';
import { requestId } from './middleware/request-id';
import { createContextLogger } from './config/logger';

// 配置模块别名，这样就可以在项目中使用 @client 别名来引用浏览器端 src 目录中的模块
addAliases({
  '@client': path.resolve(__dirname, '../../src'),
});

const app = new Koa();

// 请求 ID 中间件（放在最前面）
app.use(requestId());

// 开发环境中间件
if (ENV.isDev) {
  // 请求日志中间件
  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    const logger = createContextLogger(ctx);
    logger.debug(`${ctx.method} ${ctx.url} - ${ms}ms`);
  });

  // 错误处理中间件
  app.use(async (ctx, next) => {
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
      logger.error('Request error', {
        url: ctx.url,
        method: ctx.method,
        retcode,
        message,
        details
      });
    }
  })
}

// 生产环境中间件
if (ENV.isProd) {
  // 启用压缩
  app.use(compress({
    threshold: 2048,
    gzip: {
      flush: zlibConstants.Z_SYNC_FLUSH
    },
    deflate: {
      flush: zlibConstants.Z_SYNC_FLUSH
    },
    br: false
  }));
}

// 通用中间件
app.use(koaBody());
app.use(serve(path.join(__dirname, '../', ENV.staticDir)));

// 使用路由
app.use(router.routes());
app.use(router.allowedMethods());

// 错误处理
app.on('error', (err: Error, ctx: Koa.Context) => {
  logger.error('Server error', {
    error: err.message,
    stack: err.stack,
    url: ctx.url,
    method: ctx.method
  });
});

// 启动日志
logger.info('Server started', {
  port: ENV.port,
  env: ENV.isProd ? 'production' : 'development'
});

// 启动服务器
const server = app.listen(ENV.port, () => {
  logger.info(`Server running in ${ENV.isDev ? 'development' : 'production'} mode`);
  logger.info(`Server listening on http://${ENV.host}:${ENV.port}`);
  
  if (ENV.isDev) {
    logger.info('Hot reload is enabled - watching for file changes...');
  }
});

// 优雅关闭
// SIGTERM (Signal Terminate)，通常由系统管理员或系统进程（如 Docker、K8s）发出
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});
