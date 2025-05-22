import * as Minio from 'minio';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { ENV } from '../config/env';

interface CdnConfig {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucketName: string;
}

export class CdnService {
  private minioClient: Minio.Client;
  private bucketName: string;
  private cdnHostPrefix: string;

  constructor() {
    const config: CdnConfig = {
      endPoint: ENV.cdn.endPoint,
      port: ENV.cdn.port || 80,
      useSSL: ENV.cdn.useSSL || false,
      accessKey: ENV.cdn.accessKey,
      secretKey: ENV.cdn.secretKey,
      bucketName: ENV.cdn.bucketName
    };

    this.minioClient = new Minio.Client({
      endPoint: config.endPoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey
    });

    this.bucketName = config.bucketName;
    this.cdnHostPrefix = '';
  }

  /**
   * 从 CDN 获取 HTML 内容
   * @param path HTML 文件路径
   * @returns HTML 内容
   */
  async getHtml(path: string): Promise<string> {
    try {
      const dataStream = await this.minioClient.getObject(this.bucketName, path);
      return new Promise((resolve, reject) => {
        let content = '';
        dataStream.on('data', chunk => content += chunk);
        dataStream.on('end', () => resolve(content));
        dataStream.on('error', err => reject(err));
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get HTML from CDN: ${message}`);
    }
  }

  /**
   * 批量上传 HTML 文件到 CDN
   * @param files 本地文件路径数组
   * @returns 上传后的 CDN URL 数组
   */
  async uploadHtmlFiles(files: string[]): Promise<string[]> {
    try {
      const results = await Promise.all(files.map(file => this.uploadFile(file)));
      return results;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to upload HTML files: ${message}`);
    }
  }

  /**
   * 从 CDN 删除文件
   * @param paths 要删除的文件路径数组
   */
  async deleteFiles(paths: string[]): Promise<void> {
    try {
      await this.minioClient.removeObjects(this.bucketName, paths);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete files from CDN: ${message}`);
    }
  }

  /**
   * 上传单个文件到 CDN
   * @param file 本地文件路径
   * @returns CDN URL
   */
  private async uploadFile(file: string): Promise<string> {
    try {
      const content = await fs.promises.readFile(file);
      const hash = crypto
        .createHash('md5')
        .update(content)
        .digest('hex')
        .substring(0, 8);

      const fileName = file
        .replace(/^.*\/(?=assets\/)/, 'mgmtapph5/')
        .replace(/(?=\.[^.]+$)/, `.${hash}`);

      await this.minioClient.fPutObject(this.bucketName, fileName, file);
      console.log(`Uploaded ${this.bucketName}/${fileName} successfully`);
      
      return `${this.cdnHostPrefix}${this.bucketName}/${fileName}`;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to upload file ${file}: ${message}`);
    }
  }
} 