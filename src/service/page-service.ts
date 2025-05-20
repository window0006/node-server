import { PageEntity } from '../repository/entity/page-entity';
import { PageDao } from '../repository/dao/page-dao';

export class PageService {
  private pageDao: PageDao;

  constructor() {
    this.pageDao = new PageDao();
  }

  async getPageById(id: string): Promise<PageEntity | null> {
    return this.pageDao.findById(id);
  }

  async getPageByPath(path: string): Promise<PageEntity | null> {
    return this.pageDao.findByPath(path);
  }

  async createPage(page: {
    title: string;
    content: string;
    path: string;
    isPublished?: boolean;
    metadata?: Record<string, any>;
  }): Promise<PageEntity> {
    // 业务逻辑处理
    const normalizedPath = this.normalizePath(page.path);
    const existingPage = await this.pageDao.findByPath(normalizedPath);
    
    if (existingPage) {
      throw new Error('Page with this path already exists');
    }

    return this.pageDao.create({
      ...page,
      path: normalizedPath,
      isPublished: page.isPublished ?? false
    });
  }

  async updatePage(id: string, page: Partial<PageEntity>): Promise<PageEntity> {
    const existingPage = await this.pageDao.findById(id);
    if (!existingPage) {
      throw new Error('Page not found');
    }

    if (page.path) {
      page.path = this.normalizePath(page.path);
      const pageWithPath = await this.pageDao.findByPath(page.path);
      if (pageWithPath && pageWithPath.id !== id) {
        throw new Error('Page with this path already exists');
      }
    }

    return this.pageDao.update(id, page);
  }

  async deletePage(id: string): Promise<boolean> {
    const existingPage = await this.pageDao.findById(id);
    if (!existingPage) {
      throw new Error('Page not found');
    }

    return this.pageDao.delete(id);
  }

  private normalizePath(path: string): string {
    return path
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
  }
} 