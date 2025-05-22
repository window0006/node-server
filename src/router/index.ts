import Router from 'koa-router';
import pageRoutes from './page-routes';
import internal from './internal';
import cdn from './cdn';

const router = new Router();

// 注册所有路由
router.use(pageRoutes.routes());
router.use(pageRoutes.allowedMethods());

// 注册内部路由
router.use(internal.routes());
router.use(internal.allowedMethods());

// 注册 CDN 路由
router.use(cdn.routes());
router.use(cdn.allowedMethods());

export default router; 