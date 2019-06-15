import BluebirdPromise from 'bluebird';
global.Promise = BluebirdPromise;

import nodemailer from 'nodemailer';
import Koa from 'koa';
import config from './config.js';
import cookies from "koa-cookie";
import bodyParser from 'koa-body'
import userAgentMiddleware from "koa-useragent";
import views from "koa-views";
import path from "path";
import nunjucks from "nunjucks";

import ApiRouter from './routers/api';
import PanelRouter from "./routers/panel";

const server = new Koa();


// region Set views engine

const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(config.mainDirectory, "views", "pages")));

server.use(
	views(
		path.join(config.mainDirectory, "views", "pages"),
		{
			extension: "njk",
			map: {
				njk: "nunjucks"
			},
			options: {
				nunjucksEnv: env
			}
		}
	)
);

// endregion

server.use(cookies());

server.use(bodyParser());

server.use(userAgentMiddleware);

server.use(ApiRouter.routes());
server.use(PanelRouter.routes());

export default server.listen(config.port);
