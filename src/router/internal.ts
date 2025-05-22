import Router from 'koa-router';
import { Internal } from '../controller/internal';

const router = new Router({ prefix: '/api/internal' });
const internal = new Internal();

router
  .get('/smoke', internal.smoke)
  .get('/ping', internal.ping);

export default router;