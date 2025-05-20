export const ENV = {
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
  // 静态资源目录
  staticDir: process.env.STATIC_DIR || 'public',
  // 日志配置
  log: {
    dir: process.env.LOG_DIR || 'logs',
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  },
  // 缓存配置
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true',
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
  },
  // 性能配置
  performance: {
    // 生产环境启用压缩
    compression: process.env.NODE_ENV === 'production',
    // 生产环境启用 HTTP/2
    http2: process.env.NODE_ENV === 'production',
  }
}; 