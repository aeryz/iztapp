import BluebirdPromise from 'bluebird';

global.Promise = BluebirdPromise;

import Koa from 'koa';

import config from './config.js';

const server = new Koa();

import router from './routers/router.js'

app.use(router);

export default server.listen(config.port);
