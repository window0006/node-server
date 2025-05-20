import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  [key: string]: any;
}

class JwtService {
  private readonly secretKey: string;
  private readonly expiresIn: string;

  constructor(secretKey = process.env.JWT_SECRET || 'your-secret-key', expiresIn = '30Mins') {
    this.secretKey = secretKey;
    this.expiresIn = expiresIn;
  }

  /**
   * 生成 JWT token
   * @param payload 需要加密的数据
   * @returns JWT token 字符串
   */
  generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secretKey, {
      expiresIn: this.expiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  /**
   * 验证 JWT token
   * @param token JWT token 字符串
   * @returns 解密后的数据
   * @throws 如果 token 无效或已过期，将抛出错误
   */
  verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.secretKey) as JwtPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * 从请求头中提取 token
   * @param authHeader Authorization 请求头
   * @returns token 字符串
   * @throws 如果请求头格式不正确，将抛出错误
   */
  extractTokenFromHeader(authHeader?: string): string {
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new Error('Invalid authorization header format');
    }

    return parts[1];
  }
}

// 创建并导出单例实例
export const jwtService = new JwtService();

// 导出类型定义
export type { JwtPayload };
