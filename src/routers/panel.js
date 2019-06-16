// #region Import libraries
import path from "path";
import Router from "koa-router";
import send from "koa-send";
// #endregion

// import configurations
import config from "../config";

// import helpers
import helpers from "../helpers";

// #region Import controllers
import AccountController from "../controllers/accountController"
import ScheduleController from "../controllers/scheduleController";
import WorkerController from "../controllers/workerController";
import EmailController from "../controllers/emailController";
import EmailListController from "../controllers/emailListController";
import CourseController from "../controllers/courseController";
import RequestController from "../controllers/requestController";
// #endregion

// initialize router
const router = new Router();

// #region Enable custom error handler
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

// #endregion

// #region Asset serving routes

const rootFolder = path.join(config.mainDirectory, "views", "assets", "panel");
const notFoundFile = config.isDev ? path.join("src", "views", "assets", "panel", "404.html") : path.join("bin", "views", "assets", "panel", "404.html");

router.get("/assets/:path*",
	async (ctx, next) => {
		try {
			await next();
		} catch (err) {
			ctx.status = 404;
			await send(ctx, notFoundFile);
		}
	},
	helpers.authenticateAdmin,
	async (ctx) => {
		try {
			await send(ctx, ctx.params.path, {
				root: rootFolder,
				index: "404.html",
				hidden: true
			});
			if (!config.isDev && [".ico", ".js", ".css", ".jpg", ".jpeg", ".png", ".gif", ".pdf", ".mp4", ".flv", ".swf"].includes(path.extname(ctx.path))) ctx.set("Cache-Control", "private, max-age=31536000, immutable");
		} catch (err) {
			ctx.status = 404;
			await send(ctx, notFoundFile);
		}
	}
);

// #endregion

// #region Define routes

// #region Define unlock route

router.get("/unlock/:hash",
	async (ctx) => {
		ctx.status = 307;
		await ctx.redirect(`/api/unlock/account/${ctx.params.hash}`);
	}
);

// #endregion

// #region Login/Logout routes

router.get("/",
	async (ctx) => {
		ctx.redirect("/panel");
	}
);

router.get("/panel",
	async (ctx) => {
		const token = ctx.cookie.token;
		// @ts-ignore
		if (typeof token === "undefined" || token === null) await ctx.redirect(`/panel/login`);
		await ctx.render("panel/dashboard");
	}
);

router.get("/panel/login",
	async (ctx) => {
		await ctx.render("panel/prelogin/login");
	}
);

router.get("/panel/logout",
	async (ctx) => {
		await ctx.redirect("/api/logout");
	}
);

// #endregion

// #region Account routes

router.get("/panel/accounts",
	async (ctx) => {
		const wantedEntity = await AccountController.getAccountById(ctx.cookie.userId);
		const wantedAccounts = await AccountController.getAccounts()
		await ctx.render("panel/accounts/accounts", {
			loggedAccount: wantedEntity,
			accounts: wantedAccounts,
			typeStrings: config.accountTypeStrings
		});
	}
);

router.get("/panel/accounts/add",
	helpers.authenticateAdmin,
	async (ctx) => {
		await ctx.render("panel/accounts/add");
	}
);

router.get("/panel/accounts/search",
	helpers.authenticateAdmin,
	async (ctx) => {
		await ctx.render("panel/accounts/search", {
			config: config
		});
	}
);

router.get("/panel/accounts/:id",
	helpers.authenticateAdmin,
	async (ctx) => {
		const wantedEntity = await AccountController.getAccountById(ctx.params.id);
		await ctx.render("panel/accounts/account", {
			wantedAccount: wantedEntity,
		});
	}
);

// #endregion

// #region Email routes

router.get("/panel/emails",
	async (ctx) => {
		const wantedEmails = await EmailController.getEmails()
		await ctx.render("panel/emails/emails", {
			emails: wantedEmails,
		});
	}
);

router.get("/panel/emails/add",
	async (ctx) => {
		await ctx.render("panel/emails/add");
	}
);

// #endregion

// #region Email list routes

router.get("/panel/emailLists",
	async (ctx) => {
		const wantedEmailLists = await EmailListController.getEmailLists()
		await ctx.render("panel/emaillists/emailLists", {
			emailLists: wantedEmailLists,
		});
	}
);

router.get("/panel/emailLists/add",
	async (ctx) => {
		await ctx.render("panel/emaillists/add");
	}
);

router.get("/panel/emailLists/:id",
	async (ctx) => {
		const wantedEmailList = await EmailListController.getEmailListById(ctx.params.id);
		const wantedEmails = await EmailController.getEmails();
		await ctx.render("panel/emaillists/emailList", {
			emailList: wantedEmailList,
			emails: wantedEmails
		});
	}
);

// #endregion

// #region Course routes

router.get("/panel/courses",
	async (ctx) => {
		const wantedCourses = await CourseController.getCourses();
		await ctx.render("panel/courses/courses", {
			courses: wantedCourses,
		});
	}
);

router.get("/panel/courses/add",
	async (ctx) => {
		const wantedCourses = await CourseController.getCourses();
		const wantedWorkers = await WorkerController.getWorkers();
		await ctx.render("panel/courses/add", {
			config: config,
			courses: wantedCourses,
			workers: wantedWorkers
		});
	}
);

router.get("/panel/courses/search",
	helpers.authenticateAdmin,
	async (ctx) => {
		await ctx.render("panel/courses/search", {
			config: config
		});
	}
);

router.get("/panel/courses/:id",
	async (ctx) => {
		const wantedCourse = await CourseController.getCourse({ _id: ctx.params.id });
		const wantedCourses = await CourseController.getCourses();
		const wantedWorkers = await WorkerController.getWorkers();
		await ctx.render("panel/courses/course", {
			course: wantedCourse,
			courses: wantedCourses,
			workers: wantedWorkers,
			config: config
		});
	}
);

// #endregion

// #region Request routes

router.get("/panel/requests",
	helpers.authenticateAdmin,
	async (ctx) => {
		const wantedRequests = await RequestController.getRequests();
		await ctx.render("panel/requests/requests", {
			requests: wantedRequests,
			config: config
		});
	}
);

router.get("/panel/requests/:id",
	helpers.authenticateAdmin,
	async (ctx) => {
		const wantedRequest = await RequestController.getRequestById(ctx.params.id);
		await ctx.render("panel/requests/request", {
			request: wantedRequest,
			config: config
		});
	}
);

// #endregion

// #region Worker routes

router.get("/panel/workers",
	async (ctx) => {
		const wantedWorkers = await WorkerController.getWorkers();
		await ctx.render("panel/workers/workers", {
			workers: wantedWorkers,
		});
	}
);


router.get("/panel/workers/:id",
	async (ctx) => {
		const wantedWorker = await WorkerController.getWorkers(null, null, {_id: ctx.params.id });
		await ctx.render("panel/workers/worker", {
			worker: wantedWorker[0],
		});
	}
);

// #endregion

// #region Schedule routes

router.get("/panel/schedules/add",
	async (ctx) => {
		await ctx.render("panel/schedule/add");
	}
);

router.get("/panel/schedules/weeklySchedules",
	async (ctx) => {
		const wantedEntities = await ScheduleController.getWeeklySchedules();
		await ctx.render("panel/schedule/weeklySchedules", {
			weeklySchedules: wantedEntities,
			typeStrings: config.scheduleTypeStrings
		});
	}
);

router.get("/panel/schedules/weeklySchedules/:id",
	async (ctx) => {
		const wantedEntity = await ScheduleController.getWeeklySchedule({ _id: ctx.params.id });
		const wantedCourses = await CourseController.getCourses();
		await ctx.render("panel/schedule/weeklySchedule", {
			weeklySchedule: wantedEntity,
			config: config,
			courses: wantedCourses
		});
	}
);

// #endregion

// #region Event routes

router.get("/panel/events",
	async (ctx) => {
		await ctx.render("panel/events/events");
	}
);

router.get("/panel/events/send",
	async (ctx) => {
		if (typeof ctx.cookie.eventTitle === "undefined" || ctx.cookie.eventTitle === null) await ctx.redirect("/panel/events");
		const event = {
			title: ctx.cookie.eventTitle,
			context: ctx.cookie.eventContext + "...",
			date: ctx.cookie.eventDate,
			time: ctx.cookie.eventTime,
			link: ctx.cookie.eventLink
		};
		const wantedEmailLists = await EmailListController.getEmailLists();
		await ctx.cookies.set("eventTitle", null);
		await ctx.cookies.set("eventContext", null);
		await ctx.cookies.set("eventTime", null);
		await ctx.cookies.set("eventDate", null);
		await ctx.cookies.set("eventLink", null);
		await ctx.render("panel/events/send", {
			event: event,
			emailLists: wantedEmailLists
		});
	}
);

// #endregion

// #region 404 routes

router.get("*",
	async (ctx) => {
		ctx.status = 404;
		await ctx.render("panel/404");
	}
);

// #endregion

// #endregion

export default router;
