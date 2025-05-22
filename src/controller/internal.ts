import { Context } from 'koa';
import { ResponseUtil } from '../types/response';

export class Internal {
  /**
   * 冒烟测试接口
   * 用于部署后的快速检查服务是否启动
   */
  smoke = async (ctx: Context) => {
    ctx.body = ResponseUtil.success();
  }

  /**
   * 健康检查接口
   * 用于监控系统检查服务是否正常运行
   */
  ping = async (ctx: Context) => {
    ctx.body = 'pong';
  }
}