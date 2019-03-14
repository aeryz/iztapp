import BluebirdPromise from 'bluebird';

global.Promise = BluebirdPromise;

import Koa from 'koa';

import config from './config.js';

const server = new Koa();

export default server.listen(config.port);
