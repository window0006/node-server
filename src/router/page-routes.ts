import Router from 'koa-router';
import { PageController } from '../controller/page-controller';

const router = new Router({ prefix: '/api/pages' });
const pageController = new PageController();

router
  .get('/:id', pageController.getPage)
  .get('/by-path/:path', pageController.getPageByPath)
  .post('/', pageController.createPage)
  .put('/:id', pageController.updatePage)
  .delete('/:id', pageController.deletePage);

export default router; 