export interface EnvConfig {
  isDev: boolean;
  isProd: boolean;
  port: string | number;
  host: string;
  staticDir: string;
  log: {
    dir: string;
    level: string;
  };
  cache: {
    enabled: boolean;
    ttl: number;
  };
  performance: {
    compression: boolean;
    http2: boolean;
  };
  cdn: {
    endPoint: string;
    port: number;
    useSSL: boolean;
    accessKey: string;
    secretKey: string;
    bucketName: string;
  };
}

export const ENV: EnvConfig = {
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
  // 静态资源目录
  staticDir: process.env.STATIC_DIR || 'public',
  // 日志配置
  log: {
    dir: process.env.LOG_DIR || 'logs',
    level: process.env.LOG_LEVEL || 'info'
  },
  // 缓存配置
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true',
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10)
  },
  // 性能配置
  performance: {
    // 生产环境启用压缩
    compression: process.env.COMPRESSION_ENABLED === 'true',
    // 生产环境启用 HTTP/2
    http2: process.env.HTTP2_ENABLED === 'true'
  },
  cdn: {
    endPoint: process.env.CDN_ENDPOINT || 'localhost',
    port: parseInt(process.env.CDN_PORT || '80', 10),
    useSSL: process.env.CDN_USE_SSL === 'true',
    accessKey: process.env.CDN_ACCESS_KEY || '',
    secretKey: process.env.CDN_SECRET_KEY || '',
    bucketName: process.env.CDN_BUCKET_NAME || ''
  }
};
