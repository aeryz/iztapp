import Koa from 'koa';
import Router from "koa-router";
import AccountController from '../controllers/accountController.js';
import EmailController from '../controllers/emailController';
import WorkerController from '../controllers/workerController';
import EmailListController from '../controllers/emailListController';
import EventController from '../controllers/eventController';
import ScheduleController from "../controllers/scheduleController";
import RequestController from "../controllers/requestController";
import CourseController from "../controllers/courseController";
import helper from '../helpers.js';
import config from "../config.js"

var router = new Router();


router.use(
  async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      console.log(err.message);
      if (err.message.includes("maxFileSize exceeded")) {
        ctx.status = 400;
        ctx.body = {
          errorCode: config.errors.UPLOAD_LIMIT_EXCEED
        };
        return;
      }
      if (err.code === "ECONNABORTED") {
        ctx.status = 406;
        ctx.body = {
          errorCode: config.errors.UPLOAD_CANCELED
        };
        return;
      }
      let errorCode = +err.message;
      if (Number.isNaN(errorCode)) {
        helper.logError("Controllers / Api / Global Api Error Handler", {
          err,
          ctx
        });
        errorCode = 1;
      }
      ctx.body = {
        errorCode: errorCode
      };
      switch (errorCode) {
        case 1: { // UNKNOWN_ERROR
          ctx.status = 500;
          break;
        }
        case 2: // UNSUPPORTED_LANGUAGE
        case 3: { // API_NOT_FOUND

          ctx.status = 404;
          break;
        }
        case 4: // PERMISSON_DENIED
        case 5: // SESSION_EXPIRED
        case config.errors.LOCKED_ACCOUNT: { // LOCKED_ACCOUNT
          ctx.status = 401;
          break;
        }
        default: {
          ctx.status = 400;
          break;
        }
      }
    }
  }
);

// ACCOUNT CONTROLLER >>

router.get('/api/get/accounts/:limit/:skip/:accountType',
	async (ctx) => {
		helper.authenticateAdmin(ctx);
		if (!helper.validate(ctx.param.limit, "paramNumber")
			|| !helper.validate(ctx.param.skip, "paramNumber")) {
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
	async (ctx) => {
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
	async (ctx) => {

		// @ts-ignore
		const loggedInUser = await AccountController.login(ctx.request.body);

		// @ts-ignore
		ctx.cookies.set("token", await helper.authenticate(loggedInUser._id, ctx.userAgent), {

			// @ts-ignore
			expires: new Date(Date.now() + ((config.jwtOptions.expiresIn * 1000) * 2))

		});

		ctx.body = {
			success: true
		};

	}

);

router.get('/api/logout',
	async (ctx) => {
		ctx.cookies.set("token", null);
	}
)

router.post('/api/add/account',
	async (ctx) => {
		ctx.body = await AccountController.add(ctx.request.body);
	}
)

router.post('/api/delete/account',
	async (ctx) => {
		helper.authenticateAdmin(ctx);
		ctx.body = await AccountController.delete(ctx.params.id);
	}
)

router.post('/api/unlock/account/:hash',
	async (ctx) => {
		helper.authenticateAdmin(ctx);
		ctx.body = await AccountController.delete(ctx.params.id);
	}
)

router.post(' /api/update/password/:id',
	async (ctx) => {
		helper.authenticateAdmin(ctx);
		ctx.body = await AccountController.updatePassword(ctx.params.id, ctx.request.body.newPassword);
	}
)

// << ACCOUNT CONTROLLER

// WORKER CONTROLLER >>

router.post('/api/get/workers',
	async (ctx) => {
		if (!helper.validate(ctx.request.body.limit, "paramNumber")
			|| !helper.validate(ctx.request.body.skip, "paramNumber")) {
			throw new Error(config.errors.PARAMETER_ERROR);
		}

		ctx.body = await WorkerController.getWorkers(
			ctx.request.body.limit,
			ctx.request.body.skip,
			ctx.request.body.query
		)
	}
)

// << WORKER CONTROLLER

// EMAIL CONTROLLER >>

router.get('/api/get/emails/:limit/:skip',
	async (ctx) => {
		if (!helper.validate(ctx.param.limit, "paramNumber")
			|| !helper.validate(ctx.param.skip, "paramNumber")) {
			throw new Error(config.errors.PARAMETER_ERROR);
		}

		ctx.body = await EmailController.getEmails(
			ctx.request.body.limit,
			ctx.request.body.skip
		)
	}
)

router.post('/api/add/email',
	async (ctx) => {

		ctx.body = await EmailController.add(
			ctx.request.body
		)
	}
)

router.get('/api/delete/email/:id',
	async (ctx) => {

		ctx.body = await EmailController.delete(
			ctx.params.id
		)
	}
)

// << EMAIL CONTROLLER

// EMAIL LIST CONTROLLER >>
router.get('/api/get/emailLists/:limit/:skip',
	async (ctx) => {
		if (!helper.validate(ctx.param.limit, "paramNumber")
			|| !helper.validate(ctx.param.skip, "paramNumber")) {
			throw new Error(config.errors.PARAMETER_ERROR);
		}

		ctx.body = await EmailListController.getEmailLists(
			ctx.params.limit,
			ctx.params.skip
		)
	}
)

router.get('/api/get/emailLists/:id',
	async (ctx) => {

		ctx.body = await EmailListController.geetEmailListById(
			ctx.params.id,
		)
	}
)

router.post('/api/add/emailList',
	async (ctx) => {

		ctx.body = await EmailListController.add(
			ctx.request.body
		)
	}
)

router.post('/api/update/emailList',
	async (ctx) => {

		ctx.body = await EmailListController.update(
			ctx.request.body
		)
	}
)

router.get('/api/delete/emailList/:id',
	async (ctx) => {

		ctx.body = await EmailListController.delete(
			ctx.request.body
		)
	}
)

router.post('/api/append/emailList',
	async (ctx) => {

		ctx.body = await EmailListController.addEmailToList(
			ctx.request.body.emailId,
			ctx.request.body.emailListId
		)
	}
)

router.post('/api/remove/email',
	async (ctx) => {

		ctx.body = await EmailListController.deleteEmailFromList(
			ctx.request.body.emailId,
			ctx.request.body.emailListId
		)
	}
)

// << EMAILLISTCONTROLLER

// EVENTCONTROLLER >>
router.post('/api/pull/events',
	async (ctx) => {

		ctx.body = await EventController.pullEvents();
	}
)

router.post('/api/send/events',
	async (ctx) => {

		if (ctx.request.body.event === null || ctx.request.body.event === "") {
			throw new Error(config.errors.UNFILLED_REQUIREMENTS);
		}

		ctx.body = await EventController.sendEvent(
			ctx.request.body.event,
			ctx.request.body.emailListId
		)
	}
)

// << EVENTCONTROLLER

// SCHEDULECONTROLLER >>

router.post('/api/get/weekly/:limit/:skip',
	async (ctx) => {
		if (!helper.validate(ctx.param.limit, "paramNumber")
			|| !helper.validate(ctx.param.skip, "paramNumber")) {
			throw new Error(config.errors.PARAMETER_ERROR);
		}

		ctx.body = await ScheduleController.getWeeklySchedules(
			ctx.params.limit,
			ctx.params.skip,
			ctx.request.body
		)
	}
)

router.post('/api/get/weekly',
	async (ctx) => {

		ctx.body = await ScheduleController.getWeeklySchedule(
			ctx.request.body
		)
	}
)

router.post('/api/get/daily/:limit/:skip',
	async (ctx) => {
		if (!helper.validate(ctx.param.limit, "paramNumber")
			|| !helper.validate(ctx.param.skip, "paramNumber")) {
			throw new Error(config.errors.PARAMETER_ERROR);
		}

		ctx.body = await ScheduleController.getDailySchedules(
			ctx.params.limit,
			ctx.params.skip,
			ctx.request.body
		)
	}
)

router.post('/api/get/daily',
	async (ctx) => {

		ctx.body = await ScheduleController.getDailySchedule(
			ctx.request.body
		)
	}
)

router.post('/api/add/weeklySchedule',
	async (ctx) => {

		ctx.body = await ScheduleController.addWeeklySchedule(
			ctx.request.body
		)
	}
)

router.post('/api/update/weeklySchedule/:id',
	async (ctx) => {

		ctx.body = await ScheduleController.updateWeeklySchedule(
			ctx.params.id,
			ctx.request.body
		)
	}
)

router.get('/api/delete/weeklySchedule/:id',
	async (ctx) => {

		ctx.body = await ScheduleController.deleteWeeklySchedule(
			ctx.params.id
		)
	}
)

router.post('/api/add/dailySchedule',
	async (ctx) => {

		ctx.body = await ScheduleController.addDailySchedule(
			ctx.request.body
		)
	}
)

router.post('/api/update/dailySchedule/:id',
	async (ctx) => {

		ctx.body = await ScheduleController.updateDailySchedule(
			ctx.params.id,
			ctx.request.body
		)
	}
)

router.get('/api/delete/dailySchedule/:id',
	async (ctx) => {

		ctx.body = await ScheduleController.deleteDailySchedule(
			ctx.params.id
		)
	}
)

router.get('/api/assign/dailyToWeekly/:dailyScheduleId/:weeklyScheduleId/',
	async (ctx) => {

		ctx.body = await ScheduleController.assignDailyToWeekly(
			ctx.params.weeklyScheduleId,
			ctx.params.dailyScheduleId
		)
	}
)

router.get('/api/remove/dailyFromWeekly/:dailyScheduleId/:weeklyScheduleId/',
	async (ctx) => {

		ctx.body = await ScheduleController.removeDailyFromWeekly(
			ctx.params.weeklyScheduleId,
			ctx.params.dailyScheduleId
		)
	}
)

// << SCHEDULECONTROLLER
// REQUESTCONTROLLER >>

router.get('/api/get/requests/:limit/:skip',
	async (ctx) => {
		helper.authenticateAdmin(ctx);
		if (!helper.validate(ctx.param.limit, "paramNumber")
			|| !helper.validate(ctx.param.skip, "paramNumber")) {
			throw new Error(config.errors.PARAMETER_ERROR);
		}

		ctx.body = await RequestController.getRequests(
			ctx.params.limit,
			ctx.params.skip
		)
	}
)

router.get('/api/get/request/:id',
	async (ctx) => {

		helper.authenticateAdmin(ctx);
		ctx.body = await RequestController.getRequestById(
			ctx.params.id
		)
	}
)

router.post('/api/add/request',
	async (ctx) => {

		helper.authenticateAdmin(ctx);
		ctx.body = await RequestController.add(
			ctx.request.body
		)
	}
)

router.get('/api/delete/request/:id',
	async (ctx) => {

		helper.authenticateAdmin(ctx);
		ctx.body = await RequestController.delete(
			ctx.request.body
		)
	}
)

router.post('/api/handle/request',
	async (ctx) => {

		helper.authenticateAdmin(ctx);
		ctx.body = await RequestController.add(
			ctx.request.body.id
		)
	}
)

// << REQUESTCONTROLLER

// COURSECONTROLLER >>

router.get('/api/get/courses/:limit/:skip',
	async (ctx) => {

		if (!helper.validate(ctx.param.limit, "paramNumber")
			|| !helper.validate(ctx.param.skip, "paramNumber")) {
			throw new Error(config.errors.PARAMETER_ERROR);
		}

		ctx.body = await CourseController.getCourses(
			ctx.params.limit,
			ctx.params.skip
		)
	}
)

router.get('/api/get/course/:id',
	async (ctx) => {

		ctx.body = await CourseController.getCourse(
			ctx.params.id
		)
	}
)

router.post('/api/add/course',
	async (ctx) => {

		ctx.body = await CourseController.addCourse(
			ctx.request.body
		)
	}
)

router.post('/api/update/course/:id',
	async (ctx) => {

		ctx.body = await CourseController.updateCourse(
			ctx.params.id,
			ctx.request.body
		)
	}
)

router.get('/api/delete/course/:id',
	async (ctx) => {

		ctx.body = await CourseController.deleteCourse(
			ctx.params.id
		)
	}
)

router.get('/api/publish/course/:id',
	async (ctx) => {

		helper.authenticateAdmin(ctx);
		ctx.body = await CourseController.getCourse(
			ctx.params.id
		)
	}
)

export default router
