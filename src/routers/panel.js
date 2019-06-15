// import libraries
import path from "path";
import Router from "koa-router";
import send from "koa-send";
import bodyParser from "koa-body";
import mvCallback from "mv";
import bluebird from "bluebird";

// import configurations
import config from "../config";

// import helpers
import helpers from "../helpers";

// destructure promisify instance
const { promisify } = bluebird;

// create Promise method for mv
const mv = promisify(mvCallback);

// import controllers
import AccountController from "../controllers/accountController"
import ScheduleController from "../controllers/scheduleController";
import WorkerController from "../controllers/workerController";
import EmailController from "../controllers/emailController";
import EmailListController from "../controllers/emailListController";
import CourseController from "../controllers/courseController";
import RequestController from "../controllers/requestController";

// initialize router
const router = new Router();

// enable custom error handler
router.use(
	async (ctx, next) => {
		try {
			if (typeof ctx.cookie === "undefined" || ctx.cookie === null) ctx.cookie = {};
			await next();
		} catch (err) {
			console.log(err);
			ctx.body = {
				errorMessage: err.message
			};
		}
	}
);

// region Asset serving routes

// define required variables to avoid runtime cost
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

// region Define routes

// region Define unlock routes

router.get("/unlock/:hash",
	async (ctx) => {
		ctx.status = 307;
		await ctx.redirect(`/api/unlock/account/${ctx.params.hash}`);
	}
);

router.get("/",
	async (ctx) => {
		const token = ctx.cookie.token;
		// @ts-ignore
		if (typeof token === "undefined" || token === null) await ctx.redirect(`/login`);

		await ctx.render("panel/dashboard");
	}
);

router.get("/login",
	async (ctx) => {
		await ctx.render("panel/prelogin/login");
	}
);

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

router.get("/panel/accounts/:id",
	helpers.authenticateAdmin,
	async (ctx) => {
		const wantedEntity = await AccountController.getAccountById(ctx.params.id);
		await ctx.render("panel/accounts/account", {
			wantedAccount: wantedEntity,
		});
	}
);

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
		await ctx.render("panel/courses/add", {
			config: config
		});
	}
);

router.get("/panel/courses/:id",
	async (ctx) => {
		const wantedCourse = await CourseController.getCourse({ _id: ctx.params.id });
		await ctx.render("panel/courses/course", {
			course: wantedCourse,
			config: config
		});
	}
);

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

router.get("/panel/workers",
	async (ctx) => {
		const wantedWorkers = await WorkerController.getWorkers();
		await ctx.render("panel/workers/workers", {
			workers: wantedWorkers,
		});
	}
);

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

router.get("/panel/schedules/weeklySchedule/:id",
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

/*
// region Log in routes
router.get("/login",
	async (ctx) => {
		if (typeof ctx.cookie.token !== "undefined" || ctx.cookie.token !== null) await ctx.redirect(`/`);
		await ctx.render("panel/prelogin/login", {
			// @ts-ignore
			lang: ctx.cookie.lang,

			domains: config.domains,

			locales: {

				static: locale.fullPages.preLogin.login

			}

		});

	}

);

router.post("/:lang/login",

	helpers.middlewares.panel.setLangCookie,

	helpers.authenticator.check.notLoggedInFromCookie,

	async (ctx) => {

		const loggedInUser = await repos.admin.login(ctx.request.body);

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

// endregion

// region Bind admin checker

router.use(helpers.authenticator.check.adminFromCookie);

// endregion

// region Auto redirect for defined routes (To redirect to the route with lang)

router.get("/",

	async (ctx) => {

		// @ts-ignore
		await ctx.redirect(`/${ctx.cookie.lang}`);

	}

);

router.get("/logout",

	async (ctx) => {

		// @ts-ignore
		await ctx.redirect(`/${ctx.cookie.lang}/logout`);

	}

);

// endregion

// region Log out routes

router.get("/:lang/logout",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		ctx.cookies.set("token", null);

		// @ts-ignore
		await ctx.redirect(`/${ctx.cookie.lang}/login`);

	}

);

// endregion

// region General routes

router.get("/:lang",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		// @ts-ignore
		const locale = config.locales[ctx.cookie.lang].pages.panel;

		await ctx.render("panel/dashboard", {

			// @ts-ignore
			lang: ctx.cookie.lang,

			domains: config.domains,

			locales: {

				sidebar: locale.sections.global.sidebar,

				languages: locale.sections.global.languages,

				static: locale.fullPages.dashboard

			},

			keys: {

				page: "dashboard"

			},

			dynamic: {

				avatar: ctx.state.admin.profilePhoto,

				fullname: `${ctx.state.admin.name} ${ctx.state.admin.surname}`

			}

		});

	}

);

// region Profile routes

router.get("/:lang/profile",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		// @ts-ignore
		const locale = config.locales[ctx.cookie.lang].pages.panel;

		const limits = config.limits.admin;

		const user = await repos.admin.findOneById(ctx.state.admin._id);

		await ctx.render("panel/profile/profile", {

			// @ts-ignore
			lang: ctx.cookie.lang,

			domains: config.domains,

			locales: {

				sidebar: locale.sections.global.sidebar,

				languages: locale.sections.global.languages,

				static: locale.fullPages.profile

			},

			keys: {

				page: "profile"

			},

			dynamic: {

				avatar: user.profilePhoto,

				fullname: `${user.name} ${user.surname}`,

				data: user

			},

			limits

		});

	}

);

router.post("/:lang/updateProperties",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		ctx.request.body._id = ctx.state.admin._id;

		await repos.admin.updateProperties(ctx.request.body);

		ctx.body = { success: true };

	}

);

router.post("/:lang/updatePassword",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		ctx.request.body._id = ctx.state.admin._id;

		await repos.admin.updatePassword(ctx.request.body);

		ctx.body = { success: true };

	}

);

router.post("/:lang/updateAvatar",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		ctx.request.body._id = ctx.state.admin._id;

		await repos.admin.updateAvatar(ctx.request.body);

		ctx.body = { success: true };

	}

);

// endregion

// region Post routes

// region GET method

router.get("/:lang/posts",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		// @ts-ignore
		const locale = config.locales[ctx.cookie.lang].pages.panel;

		await ctx.render("panel/posts/all", {

			// @ts-ignore
			lang: ctx.cookie.lang,

			domains: config.domains,

			locales: {

				sidebar: locale.sections.global.sidebar,

				languages: locale.sections.global.languages,

				static: locale.fullPages.posts.all

			},

			keys: {

				page: "blog",

				subpage: "allPosts"

			},

			dynamic: {

				avatar: ctx.state.admin.profilePhoto,

				fullname: `${ctx.state.admin.name} ${ctx.state.admin.surname}`

			},

			posts: await repos.post.findByAuthor(ctx.state.admin._id)

		});

	}

);

router.get("/:lang/posts/new",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		// @ts-ignore
		const locale = config.locales[ctx.cookie.lang].pages.panel;

		const limits = config.limits.post;

		const categories = await repos.category.find();

		await ctx.render("panel/posts/new", {

			// @ts-ignore
			lang: ctx.cookie.lang,

			domains: config.domains,

			locales: {

				sidebar: locale.sections.global.sidebar,

				languages: locale.sections.global.languages,

				static: locale.fullPages.posts.new

			},

			keys: {

				page: "blog",

				subpage: "newPost"

			},

			dynamic: {

				avatar: ctx.state.admin.profilePhoto,

				fullname: `${ctx.state.admin.name} ${ctx.state.admin.surname}`

			},

			limits,

			categories

		});

	}

);

router.get("/:lang/posts/:id",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		// @ts-ignore
		const locale = config.locales[ctx.cookie.lang].pages.panel;

		const limits = config.limits.post;

		const categories = await repos.category.find();

		const post = await repos.post.findOneById(ctx.params.id);

		await ctx.render("panel/posts/details", {

			// @ts-ignore
			lang: ctx.cookie.lang,

			domains: config.domains,

			locales: {

				sidebar: locale.sections.global.sidebar,

				languages: locale.sections.global.languages,

				static: locale.fullPages.posts.details

			},

			keys: {

				page: "blog"

			},

			dynamic: {

				avatar: ctx.state.admin.profilePhoto,

				fullname: `${ctx.state.admin.name} ${ctx.state.admin.surname}`

			},

			limits,

			categories,

			post

		});

	}

);

router.get("/:lang/posts/translate/:id",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		// @ts-ignore
		const locale = config.locales[ctx.cookie.lang].pages.panel;

		const limits = config.limits.post;

		const categories = await repos.category.find();

		const post = await repos.post.findOneById(ctx.params.id);

		await ctx.render("panel/posts/translate", {

			// @ts-ignore
			lang: ctx.cookie.lang,

			domains: config.domains,

			locales: {

				sidebar: locale.sections.global.sidebar,

				languages: locale.sections.global.languages,

				static: locale.fullPages.posts.new

			},

			keys: {

				page: "blog",

				subpage: "newPost"

			},

			dynamic: {

				avatar: ctx.state.admin.profilePhoto,

				fullname: `${ctx.state.admin.name} ${ctx.state.admin.surname}`

			},

			limits,

			categories,

			post

		});

	}

);

router.get("/:lang/posts/delete/:id",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		await repos.post.delete(ctx.params.id);

		await ctx.redirect(`/${ctx.params.lang}/posts`);

	}

);

// endregion

// region POST method

router.post("/:lang/posts/new",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		ctx.request.body._author = ctx.state.admin._id;

		const addedEntity = await repos.post.add(ctx.request.body);

		ctx.body = {

			success: true,

			redirectParam: addedEntity._id

		};

	}

);

router.post("/:lang/posts/update/:id",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		await repos.post.update(ctx.params.id, ctx.request.body);

		ctx.body = {

			success: true,

			redirectParam: ctx.params.id

		};

	}

);

router.post("/:lang/posts/translate/:id",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		ctx.request.body._author = ctx.state.admin._id;

		const addedEntity = await repos.post.addTranslation(ctx.request.body, ctx.params.id);

		ctx.body = {

			success: true,

			redirectParam: addedEntity._id

		};

	}

);

// endregion

// endregion

// region Draft routes

// region GET method

router.get("/:lang/drafts",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		// @ts-ignore
		const locale = config.locales[ctx.cookie.lang].pages.panel;

		await ctx.render("panel/drafts/all", {

			// @ts-ignore
			lang: ctx.cookie.lang,

			domains: config.domains,

			locales: {

				sidebar: locale.sections.global.sidebar,

				languages: locale.sections.global.languages,

				static: locale.fullPages.drafts.all

			},

			keys: {

				page: "draft",

				subpage: "allDrafts"

			},

			dynamic: {

				avatar: ctx.state.admin.profilePhoto,

				fullname: `${ctx.state.admin.name} ${ctx.state.admin.surname}`

			},

			drafts: await repos.draft.findByAuthor(ctx.state.admin._id)

		});

	}

);

router.get("/:lang/drafts/new",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		// @ts-ignore
		const locale = config.locales[ctx.cookie.lang].pages.panel;

		const limits = config.limits.post;

		await ctx.render("panel/drafts/new", {

			// @ts-ignore
			lang: ctx.cookie.lang,

			domains: config.domains,

			locales: {

				sidebar: locale.sections.global.sidebar,

				languages: locale.sections.global.languages,

				static: locale.fullPages.drafts.new

			},

			keys: {

				page: "draft",

				subpage: "newDraft"

			},

			dynamic: {

				avatar: ctx.state.admin.profilePhoto,

				fullname: `${ctx.state.admin.name} ${ctx.state.admin.surname}`

			},

			limits

		});

	}

);

router.get("/:lang/drafts/publish/:id",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		// @ts-ignore
		const locale = config.locales[ctx.cookie.lang].pages.panel;

		const limits = config.limits.post;

		const draft = await repos.draft.findOneById(ctx.params.id);

		const categories = await repos.category.find();

		await ctx.render("panel/drafts/publish", {

			// @ts-ignore
			lang: ctx.cookie.lang,

			domains: config.domains,

			locales: {

				sidebar: locale.sections.global.sidebar,

				languages: locale.sections.global.languages,

				static: locale.fullPages.drafts.publish

			},

			keys: {

				page: "draft"

			},

			dynamic: {

				avatar: ctx.state.admin.profilePhoto,

				fullname: `${ctx.state.admin.name} ${ctx.state.admin.surname}`

			},

			limits,

			draft,

			categories

		});

	}

);

router.get("/:lang/drafts/:id",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		// @ts-ignore
		const locale = config.locales[ctx.cookie.lang].pages.panel;

		const limits = config.limits.post;

		const draft = await repos.draft.findOneById(ctx.params.id);

		await ctx.render("panel/drafts/details", {

			// @ts-ignore
			lang: ctx.cookie.lang,

			domains: config.domains,

			locales: {

				sidebar: locale.sections.global.sidebar,

				languages: locale.sections.global.languages,

				static: locale.fullPages.drafts.details

			},

			keys: {

				page: "draft"

			},

			dynamic: {

				avatar: ctx.state.admin.profilePhoto,

				fullname: `${ctx.state.admin.name} ${ctx.state.admin.surname}`

			},

			limits,

			draft

		});

	}

);

router.get("/:lang/drafts/delete/:id",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		await repos.draft.delete(ctx.params.id);

		await ctx.redirect(`/${ctx.params.lang}/drafts`);

	}

);

// endregion

// region POST method

router.post("/:lang/drafts/new",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		ctx.request.body._author = ctx.state.admin._id;

		const addedEntity = await repos.draft.add(ctx.request.body);

		ctx.body = {

			success: true,

			redirectParam: addedEntity._id

		};

	}

);

router.post("/:lang/drafts/update/:id",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		await repos.draft.update(ctx.params.id, ctx.request.body);

		ctx.body = {

			success: true,

			redirectParam: ctx.params.id

		};

	}

);

router.post("/:lang/drafts/publish/:id",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		ctx.request.body._author = ctx.state.admin._id;

		const publishedPost = await repos.draft.publish(ctx.params.id, ctx.request.body);

		ctx.body = {

			success: true,

			redirectParam: publishedPost._id

		};

	}

);

// endregion

// endregion

// region Tag routes

// region GET

router.get("/:lang/tags",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		// @ts-ignore
		const locale = config.locales[ctx.cookie.lang].pages.panel;

		await ctx.render("panel/tags/all", {

			// @ts-ignore
			lang: ctx.cookie.lang,

			domains: config.domains,

			locales: {

				sidebar: locale.sections.global.sidebar,

				languages: locale.sections.global.languages,

				static: locale.fullPages.tags.all

			},

			keys: {

				page: "tag",

				subpage: "allTags"

			},

			dynamic: {

				avatar: ctx.state.admin.profilePhoto,

				fullname: `${ctx.state.admin.name} ${ctx.state.admin.surname}`

			},

			tags: await repos.tag.find()

		});

	}

);

router.get("/:lang/tags/:id",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		// @ts-ignore
		const locale = config.locales[ctx.cookie.lang].pages.panel;

		const tag = await repos.tag.findOneById(ctx.params.id);

		const posts = await repos.post.findByTagId(tag._id);

		await ctx.render("panel/tags/details", {

			// @ts-ignore
			lang: ctx.cookie.lang,

			domains: config.domains,

			locales: {

				sidebar: locale.sections.global.sidebar,

				languages: locale.sections.global.languages,

				static: locale.fullPages.tags.details

			},

			keys: {

				page: "tag"

			},

			dynamic: {

				avatar: ctx.state.admin.profilePhoto,

				fullname: `${ctx.state.admin.name} ${ctx.state.admin.surname}`

			},

			tag,

			posts

		});

	}

);

router.get("/:lang/tags/delete/:id",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		await repos.tag.delete(ctx.params.id);

		await ctx.redirect(`/${ctx.params.lang}/tags`);

	}

);

// endregion

// region POST

router.post("/:lang/tags/update/:id",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		await repos.tag.update(ctx.request.body, ctx.params.id);

		ctx.body = {

			success: true

		};

	}

);

// endregion

// endregion

// region Category routes

// region GET

router.get("/:lang/categories",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		// @ts-ignore
		const locale = config.locales[ctx.cookie.lang].pages.panel;

		await ctx.render("panel/categories/all", {

			// @ts-ignore
			lang: ctx.cookie.lang,

			domains: config.domains,

			locales: {

				sidebar: locale.sections.global.sidebar,

				languages: locale.sections.global.languages,

				static: locale.fullPages.categories.all

			},

			keys: {

				page: "category",

				subpage: "allCategories"

			},

			dynamic: {

				avatar: ctx.state.admin.profilePhoto,

				fullname: `${ctx.state.admin.name} ${ctx.state.admin.surname}`

			},

			categories: await repos.category.find()

		});

	}

);

router.get("/:lang/categories/new",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		// @ts-ignore
		const locale = config.locales[ctx.cookie.lang].pages.panel;

		await ctx.render("panel/categories/new", {

			// @ts-ignore
			lang: ctx.cookie.lang,

			domains: config.domains,

			locales: {

				sidebar: locale.sections.global.sidebar,

				languages: locale.sections.global.languages,

				static: locale.fullPages.categories.new

			},

			keys: {

				page: "category",

				subpage: "newCategory"

			},

			dynamic: {

				avatar: ctx.state.admin.profilePhoto,

				fullname: `${ctx.state.admin.name} ${ctx.state.admin.surname}`

			}

		});

	}

);

router.get("/:lang/categories/:id",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		// @ts-ignore
		const locale = config.locales[ctx.cookie.lang].pages.panel;

		const category = await repos.category.findOneById(ctx.params.id);

		const posts = await repos.post.findByCategoryId(category._id);

		await ctx.render("panel/categories/details", {

			// @ts-ignore
			lang: ctx.cookie.lang,

			domains: config.domains,

			locales: {

				sidebar: locale.sections.global.sidebar,

				languages: locale.sections.global.languages,

				static: locale.fullPages.categories.details

			},

			keys: {

				page: "category"

			},

			dynamic: {

				avatar: ctx.state.admin.profilePhoto,

				fullname: `${ctx.state.admin.name} ${ctx.state.admin.surname}`

			},

			category,

			posts

		});

	}

);

router.get("/:lang/categories/delete/:id",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		await repos.category.delete(ctx.params.id);

		await ctx.redirect(`/${ctx.params.lang}/categories`);

	}

);

// endregion

// region POST

router.post("/:lang/categories/update/:id",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		await repos.category.update(ctx.params.id, ctx.request.body);

		ctx.body = {

			success: true

		};

	}

);

router.post("/:lang/categories/new",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		const addedEntity = await repos.category.add(ctx.request.body);

		ctx.body = {

			success: true,

			redirectParam: addedEntity._id

		};

	}

);

// endregion

// endregion

// region Management routes

router.get("/:lang/management/subscribers",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		// @ts-ignore
		const locale = config.locales[ctx.cookie.lang].pages.panel;

		await ctx.render("panel/management/subscribers", {

			// @ts-ignore
			lang: ctx.cookie.lang,

			domains: config.domains,

			locales: {

				sidebar: locale.sections.global.sidebar,

				languages: locale.sections.global.languages,

				static: locale.fullPages.management.subscribers

			},

			keys: {

				page: "management",

				subpage: "subscribers"

			},

			dynamic: {

				avatar: ctx.state.admin.profilePhoto,

				fullname: `${ctx.state.admin.name} ${ctx.state.admin.surname}`

			},

			subscribers: await repos.subscriber.find()

		});

	}

);

router.get("/:lang/management/upload",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		// @ts-ignore
		const locale = config.locales[ctx.cookie.lang].pages.panel;

		await ctx.render("panel/management/upload", {

			// @ts-ignore
			lang: ctx.cookie.lang,

			domains: config.domains,

			locales: {

				sidebar: locale.sections.global.sidebar,

				languages: locale.sections.global.languages,

				static: locale.fullPages.management.upload

			},

			keys: {

				page: "management",

				subpage: "uploadTool"

			},

			dynamic: {

				avatar: ctx.state.admin.profilePhoto,

				fullname: `${ctx.state.admin.name} ${ctx.state.admin.surname}`

			}

		});

	}

);

// endregion

// endregion

// region File upload routes

const publicDir = path.join(config.mainDirectory, "..", "public");

router.post("/upload",

	// @ts-ignore
	bodyParser({

		multipart: true,

		formidable: {

			uploadDir: publicDir,

			keepExtensions: true,

			multiples: true,

			maxFileSize: config.limits.fileUploadSize

		}

	}),

	async (ctx) => {

		const result = {};

		const now = new Date();

		const files = Object.keys(ctx.request.files);

		for (let i = 0; i < files.length; i++) {

			const file = files[i];

			const currentMonth = now.getMonth() + 1;

			const currentDate = now.getDate();

			// @ts-ignore
			const filePath = path.join("uploads", now.getFullYear().toString(), currentMonth < 10 ? `0${currentMonth.toString()}` : currentMonth.toString(), currentDate < 10 ? `0${currentDate.toString()}` : currentDate.toString(), path.basename(ctx.request.files[file].path).replace("upload_", ""));

			// @ts-ignore
			await mv(ctx.request.files[file].path, path.join(publicDir, filePath), { mkdirp: true });

			ctx.request.files[file].path = path.join(publicDir, filePath);

			result[file] = `${config.domains.static}/${filePath}`;

		}

		ctx.body = {

			success: true,

			result

		};

	}

);

// endregion

// region 404 handlers

router.get("/:lang/*",

	helpers.middlewares.panel.setLangCookie,

	async (ctx) => {

		ctx.status = 404;

		await ctx.render("panel/404", {

			// @ts-ignore
			static: config.locales[ctx.cookie.lang].pages.panel["404"]

		});

	}

);

router.get("*",

	async (ctx) => {

		ctx.status = 404;

		await ctx.render("panel/404", {

			// @ts-ignore
			static: config.locales[ctx.cookie.lang].pages.panel["404"]

		});

	}

);

// endregion

// endregion

*/

// region Export router

export default router;

// endregion
