import BluebirdPromise from 'bluebird';

global.Promise = BluebirdPromise;

import Koa from 'koa';

import config from './config.js';

const server = new Koa();

import router from './routers/router.js'

server.use(router.routes());

export default server.listen(config.port);
