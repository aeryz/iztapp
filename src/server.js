import BluebirdPromise from 'bluebird';

global.Promise = BluebirdPromise;

import Koa from 'koa';

import config from './config.js';

import cookies from "koa-cookie";

import bodyParser from 'koa-body'

import userAgentMiddleware from "koa-useragent";

const server = new Koa();

import router from './routers/router.js'

server.use(cookies());

server.use(bodyParser());

server.use(userAgentMiddleware);

server.use(router.routes());

export default server.listen(config.port);
