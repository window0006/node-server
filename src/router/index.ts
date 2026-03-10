import Router from 'koa-router';
import internal from './internal';

const router = new Router();

// 注册内部路由
router.use(internal.routes());
router.use(internal.allowedMethods());

export default router;
