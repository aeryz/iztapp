import Koa from 'koa';
import Router from "koa-router";
import AccountController from '../controllers/accountController.js';

var router = Router();

router.use('/api',
  async(ctx) => {
    const { token } = ctx.cookie;

    if (typeof token === "undefined" || token === null)
      throw new Error(config.errors.PERMISSION_DENIED);

    if (exp - Math.floor(Date.now() / 1000) < config.jwtOptions.expiresIn / 2) {

      ctx.cookies.set("token", await authenticate(wantedAdmin._id, ctx.userAgent), {
        expires: new Date(Date.now() + ((config.jwtOptions.expiresIn * 1000) * 2)),
        overwrite: true
      });
    }
  }
)

// ACCOUNT CONTROLLER >>

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

router.post(' /api/update/password/:id',
  async(ctx) => {
    helpers.authenticateAdmin(ctx);
    ctx.body = await AccountController.updatePassword(ctx.params.id, ctx.body.newPassword);
  }
)

// << ACCOUNT CONTROLLER

// WORKER CONTROLLER >>

router.post('/api/get/workers',
  async(ctx) => {
    if (!helpers.validate(ctx.body.limit, "paramNumber")
     || !helpers.validate(ctx.body.skip, "paramNumber")) {
       throw new Error(config.errors.PARAMETER_ERROR);
     }

    ctx.body = await WorkerController.getWorkers(
      ctx.body.limit,
      ctx.body.skip,
      ctx.body.query
    )
  }
)

// << WORKER CONTROLLER

// EMAIL CONTROLLER >>

router.get('/api/get/emails/:limit/:skip',
  async(ctx) => {
    if (!helpers.validate(ctx.param.limit, "paramNumber")
     || !helpers.validate(ctx.param.skip, "paramNumber")) {
       throw new Error(config.errors.PARAMETER_ERROR);
     }

    ctx.body = await EmailController.getEmails(
      ctx.body.limit,
      ctx.body.skip
    )
  }
)

router.post('/api/add/email',
  async(ctx) => {

    ctx.body = await EmailController.add(
      ctx.body
    )
  }
)

router.get('/api/delete/email/:id',
  async(ctx) => {

    ctx.body = await EmailController.delete(
      ctx.params.id
    )
  }
)

// << EMAIL CONTROLLER

// EMAIL LIST CONTROLLER >>
router.get('/api/get/emailLists/:limit/:skip',
  async(ctx) => {
    if (!helpers.validate(ctx.param.limit, "paramNumber")
     || !helpers.validate(ctx.param.skip, "paramNumber")) {
       throw new Error(config.errors.PARAMETER_ERROR);
     }

    ctx.body = await EmailListController.getEmailLists(
      ctx.params.limit,
      ctx.params.skip
    )
  }
)

router.get('/api/get/emailLists/:id',
  async(ctx) => {

    ctx.body = await EmailListController.geetEmailListById(
      ctx.params.id,
    )
  }
)

router.post('/api/add/emailList',
  async(ctx) => {

    ctx.body = await EmailListController.add(
      ctx.body
    )
  }
)

router.post('/api/update/emailList',
  async(ctx) => {

    ctx.body = await EmailListController.update(
      ctx.body
    )
  }
)

router.get('/api/delete/emailList/:id',
  async(ctx) => {

    ctx.body = await EmailListController.delete(
      ctx.body
    )
  }
)

router.post('/api/append/emailList',
  async(ctx) => {

    ctx.body = await EmailListController.addEmailToList(
      ctx.body.emailId,
      ctx.body.emailListId
    )
  }
)

router.post('/api/remove/email',
  async(ctx) => {

    ctx.body = await EmailListController.deleteEmailFromList(
      ctx.body.emailId,
      ctx.body.emailListId
    )
  }
)

// << EMAILLISTCONTROLLER

// EVENTCONTROLLER >>
router.post('/api/pull/events',
  async(ctx) => {

    ctx.body = await EventController.pullEvents();
  }
)

router.post('/api/send/events',
  async(ctx) => {

    if (ctx.body.event === null || ctx.body.event === "") {
      throw new Error(config.errors.UNFILLED_REQUIREMENTS);
    }

    ctx.body = await EventController.sendEvent(
      ctx.body.event,
      ctx.body.emailListId
    )
  }
)

// << EVENTCONTROLLER

// SCHEDULECONTROLLER >>

router.post('/api/get/weekly/:limit/:skip',
  async(ctx) => {
    if (!helpers.validate(ctx.param.limit, "paramNumber")
     || !helpers.validate(ctx.param.skip, "paramNumber")) {
       throw new Error(config.errors.PARAMETER_ERROR);
     }

    ctx.body = await ScheduleController.getWeeklySchedules(
      ctx.params.limit,
      ctx.params.skip,
      ctx.body
    )
  }
)

router.post('/api/get/weekly',
  async(ctx) => {

    ctx.body = await ScheduleController.getWeeklySchedule(
      ctx.body
    )
  }
)

router.post('/api/get/daily/:limit/:skip',
  async(ctx) => {
    if (!helpers.validate(ctx.param.limit, "paramNumber")
     || !helpers.validate(ctx.param.skip, "paramNumber")) {
       throw new Error(config.errors.PARAMETER_ERROR);
     }

    ctx.body = await ScheduleController.getDailySchedules(
      ctx.params.limit,
      ctx.params.skip,
      ctx.body
    )
  }
)

router.post('/api/get/daily',
  async(ctx) => {

    ctx.body = await ScheduleController.getDailySchedule(
      ctx.body
    )
  }
)

router.post('/api/add/weeklySchedule',
  async(ctx) => {

    ctx.body = await ScheduleController.addWeeklySchedule(
      ctx.body
    )
  }
)

router.post('/api/update/weeklySchedule/:id',
  async(ctx) => {

    ctx.body = await ScheduleController.updateWeeklySchedule(
      ctx.params.id,
      ctx.body
    )
  }
)

router.get('/api/delete/weeklySchedule/:id',
  async(ctx) => {

    ctx.body = await ScheduleController.deleteWeeklySchedule(
      ctx.params.id
    )
  }
)

router.post('/api/add/dailySchedule',
  async(ctx) => {

    ctx.body = await ScheduleController.addDailySchedule(
      ctx.body
    )
  }
)

router.post('/api/update/dailySchedule/:id',
  async(ctx) => {

    ctx.body = await ScheduleController.updateDailySchedule(
      ctx.params.id,
      ctx.body
    )
  }
)

router.get('/api/delete/dailySchedule/:id',
  async(ctx) => {

    ctx.body = await ScheduleController.deleteDailySchedule(
      ctx.params.id
    )
  }
)

router.get('/api/assign/dailyToWeekly/:dailyScheduleId/:weeklyScheduleId/',
  async(ctx) => {

    ctx.body = await ScheduleController.assignDailyToWeekly(
      ctx.params.weeklyScheduleId,
      ctx.params.dailyScheduleId
    )
  }
)

router.get('/api/remove/dailyFromWeekly/:dailyScheduleId/:weeklyScheduleId/',
  async(ctx) => {

    ctx.body = await ScheduleController.removeDailyFromWeekly(
      ctx.params.weeklyScheduleId,
      ctx.params.dailyScheduleId
    )
  }
)

// << SCHEDULECONTROLLER
// REQUESTCONTROLLER >>

router.get('/api/get/requests/:limit/:skip',
  async(ctx) => {
    helper.authenticateAdmin(ctx);
    if (!helpers.validate(ctx.param.limit, "paramNumber")
     || !helpers.validate(ctx.param.skip, "paramNumber")) {
       throw new Error(config.errors.PARAMETER_ERROR);
     }

    ctx.body = await RequestController.getRequests(
      ctx.params.limit,
      ctx.params.skip
    )
  }
)

router.get('/api/get/request/:id',
  async(ctx) => {

    helper.authenticateAdmin(ctx);
    ctx.body = await RequestController.getRequestById(
      ctx.params.id
    )
  }
)

router.post('/api/add/request',
  async(ctx) => {

    helper.authenticateAdmin(ctx);
    ctx.body = await RequestController.add(
      ctx.body
    )
  }
)

router.get('/api/delete/request/:id',
  async(ctx) => {

    helper.authenticateAdmin(ctx);
    ctx.body = await RequestController.delete(
      ctx.body
    )
  }
)

router.post('/api/handle/request',
  async(ctx) => {

    helper.authenticateAdmin(ctx);
    ctx.body = await RequestController.add(
      ctx.body.id,
      ctx.body.state
    )
  }
)

// << REQUESTCONTROLLER

// COURSECONTROLLER >>

router.get('/api/get/courses/:limit/:skip',
  async(ctx) => {

    if (!helpers.validate(ctx.param.limit, "paramNumber")
     || !helpers.validate(ctx.param.skip, "paramNumber")) {
       throw new Error(config.errors.PARAMETER_ERROR);
     }

    ctx.body = await CourseController.getCourses(
      ctx.params.limit,
      ctx.params.skip
    )
  }
)

router.get('/api/get/course/:id',
  async(ctx) => {

    ctx.body = await CourseController.getCourse(
      ctx.params.id
    )
  }
)

router.post('/api/add/course',
  async(ctx) => {

    ctx.body = await CourseController.addCourse(
      ctx.body
    )
  }
)

router.post('/api/update/course/:id',
  async(ctx) => {

    ctx.body = await CourseController.updateCourse(
      ctx.params.id,
      ctx.body
    )
  }
)

router.get('/api/delete/course/:id',
  async(ctx) => {

    ctx.body = await CourseController.deleteCourse(
      ctx.params.id
    )
  }
)

router.get('/api/publish/course/:id',
  async(ctx) => {

    helper.authenticateAdmin(ctx);
    ctx.body = await CourseController.getCourse(
      ctx.params.id
    )
  }
)

module.exports = router
