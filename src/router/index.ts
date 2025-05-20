import Router from 'koa-router';
import pageRoutes from './page-routes';

const router = new Router();

// 注册所有路由
router.use(pageRoutes.routes());
router.use(pageRoutes.allowedMethods());

export default router; 