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
			if (typeof ctx.cookie === "undefined" || ctx.cookie === null) ctx.cookie = {};
			await next();
		} catch (err) {
			await ctx.render("panel/errors", {
				message: err.message
			});
		}
	}
);

// #region Account Controller

router.post("/api/login",
	async (ctx) => {
		const loggedInUser = await AccountController.login(ctx.request.body);

		// @ts-ignore
		ctx.cookies.set("token", await helper.authenticate(loggedInUser._id, ctx.userAgent), {
			// @ts-ignore
			expires: new Date(Date.now() + ((config.jwtOptions.expiresIn * 1000) * 2))
		});

		ctx.cookies.set("userId", loggedInUser._id);
		await ctx.redirect("/panel");
	}
);

router.get('/api/unlock/account/:hash',
	async (ctx) => {
		await AccountController.unlockAccount(ctx.params.hash);
		ctx.redirect("/panel/login");
	}
);

router.use(helper.isLoggedIn);

router.get('/api/logout',
	async (ctx) => {
		ctx.cookies.set("token", null);
		ctx.cookies.set("userId", null);
		await ctx.redirect("/panel/login");
	}
);

router.get('/api/get/accounts/:accountType/:limit?/:skip?',
	helper.authenticateAdmin,
	async (ctx) => {
		ctx.body = await AccountController.getAccounts(
			ctx.params.limit,
			ctx.params.skip,
			ctx.params.accountType
		);
	}
);

router.get('/api/get/account/:id',
	async (ctx) => {
		if (+ctx.params.id === 0) ctx.params.id = ctx.cookie.userId;
		const loggedEntity = await AccountController.getAccountById(ctx.cookie.userId);
		if (loggedEntity.type === 2) ctx.body = await AccountController.getAccountById(ctx.params.id);
		else if (loggedEntity.type === 1 && ctx.params.id === 0) ctx.body = loggedEntity;
		else throw new Error(config.errors.PERMISSION_DENIED);
	}
);

router.post('/api/add/account',
	// helper.authenticateAdmin,
	async (ctx) => {
		const newEntity = await AccountController.add(ctx.request.body);
		await ctx.redirect(`/panel/accounts/${newEntity._id}`);
	}
);

router.post('/api/delete/account',
	helper.authenticateAdmin,
	async (ctx) => {
		const userId = ctx.cookie.userId + "";
		if (userId === ctx.request.body.id) throw new Error(config.errors.ACCOUNT.CANT_DELETE_OWN);
		await AccountController.delete(ctx.request.body.id);
		await ctx.redirect("/panel/accounts");
	}
);

router.post('/api/update/password/:id',
	helper.authenticateAdmin,
	async (ctx) => {
		await AccountController.updatePassword(ctx.params.id, ctx.request.body.newPassword);
		await ctx.redirect(`/panel/accounts/${ctx.params.id}`);
	}
);

// #endregion

// #region Worker Controller

router.post('/api/get/workers/:limit?/:skip?',
	helper.isLoggedIn,
	async (ctx) => {
		ctx.body = await WorkerController.getWorkers(
			ctx.params.limit,
			ctx.params.skip,
			ctx.request.body
		)
	}
);

// #endregion

// #region Email Controller

router.get('/api/get/emails/:limit?/:skip?',
	async (ctx) => {
		ctx.body = await EmailController.getEmails(
			ctx.params.limit,
			ctx.params.skip
		);
	}
);

router.post('/api/add/email',
	async (ctx) => {
		await EmailController.add(
			ctx.request.body
		);
		await ctx.redirect("/panel/emails");
	}
);

router.get('/api/delete/email/:id',
	async (ctx) => {
		await EmailController.delete(
			ctx.params.id
		);
		await ctx.redirect("/panel/emails")
	}
);

// #endregion

// #region Email List Controller

router.get('/api/get/emailLists/:limit?/:skip?',
	async (ctx) => {
		ctx.body = await EmailListController.getEmailLists(
			ctx.params.limit,
			ctx.params.skip
		);
	}
);

router.get('/api/get/emailList/:id',
	async (ctx) => {
		ctx.body = await EmailListController.getEmailListById(
			ctx.params.id,
		);
	}
);

router.post('/api/add/emailList',
	async (ctx) => {
		const newEntity = await EmailListController.add(
			ctx.request.body
		);
		await ctx.redirect(`/panel/emailLists/${newEntity._id}`);
	}
);

router.post('/api/update/emailList',
	async (ctx) => {
		const updatedEntity = await EmailListController.update(
			ctx.request.body.id,
			ctx.request.body
		);
		await ctx.redirect(`/panel/emailLists/${updatedEntity._id}`)
	}
);

router.get('/api/delete/emailList/:id',
	async (ctx) => {
		await EmailListController.delete(
			ctx.params.id
		);
		await ctx.redirect("/panel/emailLists")
	}
);

router.post('/api/append/emailList',
	async (ctx) => {
		await EmailListController.addEmailToList(
			ctx.request.body.emailId,
			ctx.request.body.emailListId
		);
		await ctx.redirect(`/panel/emailLists/${ctx.request.body.emailListId}`);
	}
);

router.post('/api/remove/email',
	async (ctx) => {
		EmailListController.removeEmailFromList(
			ctx.request.body.emailId,
			ctx.request.body.emailListId
		);
		await ctx.redirect(`/panel/emailLists/${ctx.request.body.emailListId}`);
	}
);

// #endregion

// #region Event Controller

router.post('/api/pull/events',
	async (ctx) => {
		ctx.body = await EventController.pullEvents();
	}
)

router.post('/api/set/event',
	async (ctx) => {
		await ctx.cookies.set("eventTitle", ctx.request.body.title);
		await ctx.cookies.set("eventContext", ctx.request.body.context);
		await ctx.cookies.set("eventTime", ctx.request.body.time);
		await ctx.cookies.set("eventDate", ctx.request.body.date);
		await ctx.cookies.set("eventLink", ctx.request.body.link);
		await ctx.redirect("/panel/events/send");
	}
)

router.post('/api/send/events',
	async (ctx) => {
		await EventController.sendEvent(
			ctx.request.body,
			ctx.request.body.emailListId
		);
		await ctx.redirect("/panel/events");
	}
);

// #endregion

// #region Schedule Controller

router.post('/api/get/weeklySchedules/:limit?/:skip?',
	async (ctx) => {
		ctx.body = await ScheduleController.getWeeklySchedules(
			ctx.params.limit,
			ctx.params.skip,
			ctx.request.body
		);
	}
);

router.post('/api/get/weekly',
	async (ctx) => {
		ctx.body = await ScheduleController.getWeeklySchedule(
			ctx.request.body
		);
	}
);

router.post('/api/get/dailySchedules/:limit?/:skip?',
	async (ctx) => {
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
		const newEntity = await ScheduleController.addWeeklySchedule(
			ctx.request.body
		);
		await ctx.redirect(`/panel/schedules/weeklySchedules/${newEntity._id}`)
	}
);

router.post('/api/update/weeklySchedule/:id',
	async (ctx) => {
		const updatedEntity = await ScheduleController.updateWeeklySchedule(
			ctx.params.id,
			ctx.request.body
		);
		await ctx.redirect(`/panel/schedules/weeklySchedules/${updatedEntity._id}`)
	}
);

router.get('/api/delete/weeklySchedule/:id',
	async (ctx) => {
		await ScheduleController.deleteWeeklySchedule(
			ctx.params.id
		);
		await ctx.redirect("/panel/schedules/weeklySchedules");
	}
);

router.post('/api/add/dailySchedule',
	async (ctx) => {
		ctx.body = await ScheduleController.addDailySchedule(
			ctx.request.body
		);
	}
);

router.post('/api/update/dailySchedule/:id',
	async (ctx) => {
		ctx.body = await ScheduleController.updateDailySchedule(
			ctx.params.id,
			ctx.request.body
		);
	}
);

router.get('/api/delete/dailySchedule/:id',
	async (ctx) => {
		ctx.body = await ScheduleController.deleteDailySchedule(
			ctx.params.id
		);
	}
);

router.get('/api/assign/dailyToWeekly/:dailyScheduleId/:weeklyScheduleId/',
	async (ctx) => {
		const dailySchedule = await ScheduleController.getDailySchedule({_id: ctx.params.dailyScheduleId});
		ctx.body = await ScheduleController.assignDailyToWeekly(
			ctx.params.weeklyScheduleId,
			ctx.params.dailyScheduleId,
			dailySchedule.day
		);
	}
);

router.get('/api/remove/dailyFromWeekly/:dailyScheduleId/:weeklyScheduleId/',
	async (ctx) => {
		ctx.body = await ScheduleController.removeDailyFromWeekly(
			ctx.params.weeklyScheduleId,
			ctx.params.dailyScheduleId
		);
	}
);

// #endregion

// #region Request Controller

router.get('/api/get/requests/:limit?/:skip?',
	helper.authenticateAdmin,
	async (ctx) => {
		ctx.body = await RequestController.getRequests(
			ctx.params.limit,
			ctx.params.skip
		);
	}
);

router.get('/api/get/request/:id',
	helper.authenticateAdmin,
	async (ctx) => {
		ctx.body = await RequestController.getRequestById(
			ctx.params.id
		);
	}
);

router.post('/api/add/request',
	helper.authenticateAdmin,
	async (ctx) => {
		ctx.body = await RequestController.add(
			ctx.request.body
		);
	}
);

router.get('/api/delete/request/:id',
	helper.authenticateAdmin,
	async (ctx) => {
		ctx.body = await RequestController.delete(
			ctx.request.body
		);
	}
);

router.post('/api/handle/request',
	helper.authenticateAdmin,
	async (ctx) => {
		await RequestController.handleRequest(
			ctx.request.body.id,
			ctx.request.body.state
		);
		await ctx.redirect("/panel/requests");
	}
);

// #endregion

// #region Course Controller

router.get('/api/get/courses/:limit?/:skip?',
	async (ctx) => {
		ctx.body = await CourseController.getCourses(
			ctx.params.limit,
			ctx.params.skip,
			ctx.request.body
		)
	}
)

router.get('/api/get/course/:id',
	async (ctx) => {
		const query = {
			_id: ctx.params.id
		};
		ctx.body = await CourseController.getCourse(query);
	}
);

router.post('/api/add/course',
	async (ctx) => {
		ctx.request.body.courseCreator = ctx.cookie.userId;
		const newEntity = await CourseController.add(
			ctx.request.body
		);
		ctx.body = newEntity;
	}
);

router.post('/api/update/course/:id',
	async (ctx) => {
		ctx.request.body.courseUpdator = ctx.cookie.userId;
		const updatedEntity = await CourseController.update(
			ctx.params.id,
			ctx.request.body
		);
		ctx.body = updatedEntity;
	}
);

router.get('/api/delete/course/:id',
	async (ctx) => {
		let deletorId = ctx.cookie.userId;
		const loggedUser = await AccountController.getAccountById(ctx.cookie.userId);
		if (loggedUser.type === 2) deletorId = 0;
		await CourseController.delete(
			ctx.params.id,
			deletorId
		);
		await ctx.redirect("/panel/courses");
	}
);

router.get('/api/publish/course/:id',
	helper.authenticateAdmin,
	async (ctx) => {
		ctx.body = await CourseController.publishCourse(
			ctx.params.id
		);
	}
);

// #endregion

export default router
