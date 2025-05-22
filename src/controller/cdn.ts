import { Context } from 'koa';
import { ResponseUtil } from '../types/response';
import { CdnService } from '../service/cdn';

export class Cdn {
  private cdnService: CdnService;

  constructor() {
    this.cdnService = new CdnService();
  }

  /**
   * 获取 HTML 内容
   * @param ctx Koa 上下文
   */
  getHtml = async (ctx: Context) => {
    try {
      const { path } = ctx.params;
      const html = await this.cdnService.getHtml(path);
      ctx.body = ResponseUtil.success(html);
    } catch (error) {
      ctx.body = ResponseUtil.error(error instanceof Error ? error.message : 'Internal server error');
    }
  }
} 