import Router from 'koa-router';
import { Cdn } from '../controller/cdn';

const router = new Router({ prefix: '/api/cdn' });
const cdn = new Cdn();

router.get('/html/:path(*)', cdn.getHtml);

export default router; 