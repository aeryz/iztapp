import Koa from 'koa';
import Router from "koa-router";
import AccountController from '../controllers/accountController.js';

var router = Router();


router.get('/api/get/accounts/:limit/:skip/:accountType',
  async(ctx) => {
    helper.authenticateAdmin(ctx);
    if (!helpers.validate(ctx.param.limit, "paramNumber")
     || !helpers.validate(ctx.param.skip, "paramNumber")) {
       throw new Error(config.errors.PARAMETER_ERROR);
     }

    ctx.body = await AccountController.getAccounts(
      ctx.param.limit,
      ctx.param.skip,
      ctx.param.accountType
    )
  }
)

router.get('/api/get/account/:id',
  async(ctx) => {
    if (ctx.id !== 0) {
      helper.authenticateAdmin(ctx);
    }

    ctx.body = await AccountController.getAccounts(
      ctx.param.limit,
      ctx.param.skip,
      ctx.param.accountType
    )
  }
)

router.post("/login",

  helpers.notLoggedInFromCookie,

  async (ctx) => {

    const loggedInUser = await AccountController.login(ctx.request.body);

    // @ts-ignore
    ctx.cookies.set("token", await helpers.authenticator.authenticate(loggedInUser._id, ctx.userAgent), {

      // @ts-ignore
      expires: new Date(Date.now() + ((config.jwtOptions.expiresIn * 1000) * 2))

    });

    ctx.body = {
      success: true
    };

  }

);

router.get('/api/logout',
  async(ctx) => {
    ctx.cookies.set("token", null);
  }
)

router.post('/api/add/account',
  async(ctx) => {
    ctx.body = await AccountController.add(ctx.body);
  }
)

router.post('/api/delete/account',
  async(ctx) => {
    helpers.authenticateAdmin(ctx);
    ctx.body = await AccountController.delete(ctx.params.id);
  }
)

router.post('/api/unlock/account/:hash',
  async(ctx) => {
    helpers.authenticateAdmin(ctx);
    ctx.body = await AccountController.delete(ctx.params.id);
  }
)
