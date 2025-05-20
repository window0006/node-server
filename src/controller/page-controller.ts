import { Context } from 'koa';
import { PageService } from '../service/page-service';
import { ApiResponse } from '../common/utils/response';

export class PageController {
  private pageService: PageService;

  constructor() {
    this.pageService = new PageService();
  }

  getPage = async (ctx: Context) => {
    try {
      const { id } = ctx.params;
      const page = await this.pageService.getPageById(id);
      
      if (!page) {
        ctx.body = ApiResponse.error('Page not found', 404);
        return;
      }

      ctx.body = ApiResponse.success(page);
    } catch (error) {
      ctx.body = ApiResponse.error(error instanceof Error ? error.message : 'Internal server error');
    }
  }

  getPageByPath = async (ctx: Context) => {
    try {
      const { path } = ctx.params;
      const page = await this.pageService.getPageByPath(path);
      
      if (!page) {
        ctx.body = ApiResponse.error('Page not found', 404);
        return;
      }

      ctx.body = ApiResponse.success(page);
    } catch (error) {
      ctx.body = ApiResponse.error(error instanceof Error ? error.message : 'Internal server error');
    }
  }

  createPage = async (ctx: Context) => {
    try {
      const pageData = ctx.request.body;
      const page = await this.pageService.createPage(pageData);
      ctx.body = ApiResponse.success(page, 201);
    } catch (error) {
      ctx.body = ApiResponse.error(error instanceof Error ? error.message : 'Internal server error');
    }
  }

  updatePage = async (ctx: Context) => {
    try {
      const { id } = ctx.params;
      const pageData = ctx.request.body;
      const page = await this.pageService.updatePage(id, pageData);
      ctx.body = ApiResponse.success(page);
    } catch (error) {
      ctx.body = ApiResponse.error(error instanceof Error ? error.message : 'Internal server error');
    }
  }

  deletePage = async (ctx: Context) => {
    try {
      const { id } = ctx.params;
      await this.pageService.deletePage(id);
      ctx.body = ApiResponse.success(undefined, 204);
    } catch (error) {
      ctx.body = ApiResponse.error(error instanceof Error ? error.message : 'Internal server error');
    }
  }
} 