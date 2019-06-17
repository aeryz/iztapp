// import libraries
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";
import speakingurl from "speakingurl";
import bluebird from "bluebird";
import jsonwebtoken from "jsonwebtoken";
import nodemailer from 'nodemailer';
import wordpress from 'wordpress';
import HtmlTableToJson from 'html-table-to-json';

// import config
import config from "./config";

// import controllers
import AccountController from "./controllers/accountController";
import ScheduleController from "./controllers/scheduleController";

const client = wordpress.createClient({
	url: "https://ceng316group05.wordpress.com/",
	username: "iztechdebak",
	password: "debak_iztech"
});

// set promises and jwt
const {
	promisify
} = bluebird;
const jwt = {
	sign: promisify(jsonwebtoken.sign),
	verify: promisify(jsonwebtoken.verify)
};

const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 465,
	secure: true,
	auth: {
		user: 'info.debak@gmail.com',
		pass: 'debak123.123.A'
	}
});

// functions
async function generatePagePath(data) {
	return speakingurl(data);
};

async function publishCourse(course) {
	let uniq = course.departmentCode + ' ' + course.courseCode;
	client.newPost({
		type: "page",
		title: uniq,
		content: `<ul><li>Course Name: ${course.name}</li><li>Course Description: ${course.description}</li><li>Course Code: ${course.courseCode}</li><li>Course Department Code: ${course.departmentCode}</li><li>Course Topics: ${course.topics}</li><li>Course Type: ${config.scheduleTypeStrings[course.type]}</li><li>Course Credits: ${course.credits}</li><li>Course ECTS: ${course.ects}</li><li>Course Lecture Hours: ${course.lectureHours}</li><li>Course Lab Hours: ${course.labHours}</li></ul>`,
		status: "publish",
	}, function (error, data) {
		console.log("Post sent! The server replied with the following:\n");
	});

	client.getPost("18", function (error, post) {

		let data = post.content;

		data += '<br><a href="https://ceng316group05.wordpress.com/' + course.departmentCode + '-' + course.courseCode + '/">' + uniq + '</a>'

		client.editPost(post.id, {
			content: data
		}, function (error) {
			console.log(error);
		})
	})
};

async function updateCourse(course) {
	client.getPosts({ type: "page" }, function (error, posts) {
		let id = ""
		let link = ""
		const title = `${course.departmentCode} ${course.courseCode}`;
		const data = {
			content: `<ul><li>Course Name: ${course.name}</li><li>Course Description: ${course.description}</li><li>Course Code: ${course.courseCode}</li><li>Course Department Code: ${course.departmentCode}</li><li>Course Topics: ${course.topics}</li><li>Course Type: ${config.scheduleTypeStrings[course.type]}</li><li>Course Credits: ${course.credits}</li><li>Course ECTS: ${course.ects}</li><li>Course Lecture Hours: ${course.lectureHours}</li><li>Course Lab Hours: ${course.labHours}</li></ul>`
		};

		for (let post of posts) {
			if (title.toLowerCase() === post.title.toLowerCase()) {
				id = post.id
				link = post.link.toLowerCase()
			}
		};

		client.editPost(id, data, function(error) {
			console.log(error);
		});
	});
}

async function deleteCourse(title) {
	client.getPosts({type: "page"},function (error, posts) {
		let id = ""
		let link = ""

		for (let post of posts) {
			if (title.toLowerCase() === post.title.toLowerCase()) {
				id = post.id
				link = post.link.toLowerCase()
			}
		}

		client.deletePost(id, function (error) {
			console.log(error);
		})

		client.getPost('18', function (error, post) {
			let content = post.content;

			let links = content.split('<br>')

			let html = "";

			for (let l of links) {
				if (!l.toLowerCase().includes(link)) {
					html += l;
					html += '<br>'
				}
			}

			client.editPost("18", {
				content: html
			}, function (error) {
				console.log(error);
			})

		})

	})
};

function addWeekly(weekly) {

	let htmlContent = ""

	htmlContent += '<!-- wp:table {"align":"center"} -->'
	htmlContent += '<table class="wp-block-table aligncenter">'
	htmlContent += '<tbody>'

	htmlContent += '<tr>'
	htmlContent += '<td><strong></strong> </td>'
	htmlContent += '<td><strong>Monday</strong> </td>'
	htmlContent += '<td><strong>Tuesday</strong> </td>'
	htmlContent += '<td><strong>Wednesday</strong> </td>'
	htmlContent += '<td><strong>Thursday</strong> </td>'
	htmlContent += '<td><strong>Friday</strong> </td>'
	htmlContent += '</tr>'
	for (let i = 0; i < 8; i++) {
		htmlContent += '<tr>'
		htmlContent += '<td><strong>' + i + '</strong> </td>'
		htmlContent += '<td><strong></strong> </td>'
		htmlContent += '<td><strong></strong> </td>'
		htmlContent += '<td><strong></strong> </td>'
		htmlContent += '<td><strong></strong> </td>'
		htmlContent += '<td><strong></strong> </td>'
		htmlContent += '</tr>'
	}

	htmlContent += '</tbody>'
	htmlContent += '</table>'
	htmlContent += '<!-- /wp:table -->'

	let uniq = config.scheduleTypeStrings[weekly.type] + '-' + weekly.semester;

	client.newPost({
		type: 'page',
		title: uniq,
		content: htmlContent,
		status: "publish"
	}, function (error, data) {
		console.log(error);
	})

	client.getPost("16", function (error, post) {

		let data = post.content;

		data += '<br><a href="https://ceng316group05.wordpress.com/' + uniq + '/">' + uniq + '</a>'

		client.editPost(post.id, {
			content: data
		}, function (error) {
			console.log(error);
		})
	})
};

async function deleteWeekly(title) {
	client.getPosts({ type: "page" }, function (error, posts) {
		let id = ""
		let link = ""

		for (let post of posts) {
			if (title === post.title) {
				id = post.id
				link = post.link.toLowerCase()
			}
		}

		client.deletePost(id, function (error) {
			console.log(error);
		})

		client.getPost('16', function (error, post) {
			let content = post.content;

			let links = content.split('<br>')

			let html = "";

			for (let l of links) {
				if (!l.toLowerCase().includes(link)) {
					html += l;
					html += '<br>'
				}
			}

			client.editPost("16", {
				content: html
			}, function (error) {
				console.log(error);
			})

		})

	})
};


async function sendMail(emailList, context) {
	for (let email of emailList) {
		let mailOptions = {
			from: '"DEBAK" <info.debak@gmail.com>',
			to: email,
			subject: context.subject,
			text: context.text
		}

		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				return console.log(error);
			}
			console.log('Message %s sent: %s', info.messageId, info.response);
		});
	}
};

async function validate(data, type, noError = false) {
	try {
		switch (type) {
			case "id": {
				data += "";
				const lengthOfData = data.length;
				let isValid = false;
				if (lengthOfData === 12 || lengthOfData === 24) isValid = (/^[0-9a-fA-F]+$/).test(data);
				if (!isValid) throw new Error(config.errors.VALIDATION.INVALID_ID);
				break;
			}
			case "email": {
				if (!validator.isEmail(data)) throw new Error(config.errors.VALIDATION.INVALID_EMAIL);
				break;
			}
			case "isEmail": {
				if (validator.isEmail(data)) return true;
				return false;
			}
			case "paramNumber": {
				if (Number.isNaN(data) || data < 0) return false;
				return true;
			}
			default: {
				throw new Error(config.errors.VALIDATION.INVALID_VALIDATION_TYPE);
			}
		}
		return true;
	} catch (err) {
		if (noError === true) return false;
		throw err;
	};
};

async function comparePassword(password, hash) {
	return bcrypt.compare(password, hash);
};

async function verifyToken(token, userAgent) {
	try {
		// @ts-ignore
		const decodedToken = await jwt.verify(token, config.jwtOptions.secret);
		const userAgentHash = crypto.createHash(config.hashAlgorithm).update(userAgent.toString()).digest("hex");
		let finalUserAgentHash = "";
		for (let i = 0; i < 64; i += 2) finalUserAgentHash += userAgentHash[i];
		if (decodedToken.h.toString() !== finalUserAgentHash) throw new Error(config.errors.PERMISSION_DENIED);
		const encryptedIdBuffer = Buffer.from(decodedToken.t.toString(), "base64");
		const iv = encryptedIdBuffer.slice(0, config.jwtOptions.idEncryptionIvSize);
		const encryptedId = encryptedIdBuffer.slice(config.jwtOptions.idEncryptionIvSize, encryptedIdBuffer.length);
		const decipher = crypto.createDecipheriv(config.encryptionAlgorithm, config.jwtOptions.idEncryptionSecret, iv);
		const decryptedId = Buffer.concat([decipher.update(encryptedId), decipher.final()]).toString("utf8");
		return {
			id: decryptedId,
			exp: decodedToken.exp
		};
	} catch (err) {
		if (err.name === "TokenExpiredError") throw new Error(config.errors.SESSION_EXPIRED);
		throw new Error(config.errors.PERMISSION_DENIED);
	}
}

async function authenticate(id, userAgent) {
	id += "";
	const iv = crypto.randomBytes(config.jwtOptions.idEncryptionIvSize);
	const cipher = crypto.createCipheriv(config.encryptionAlgorithm, config.jwtOptions.idEncryptionSecret, iv);
	const encryptedId = Buffer.concat([iv, cipher.update(id), cipher.final()]).toString("base64");
	const userAgentHash = crypto.createHash(config.hashAlgorithm).update(userAgent.source.toString()).digest("hex");
	let finalUserAgentHash = "";
	for (let i = 0; i < 64; i += 2) finalUserAgentHash += userAgentHash[i];

	// @ts-ignore
	const token = await jwt.sign({
			t: encryptedId,
			h: finalUserAgentHash
		},
		config.jwtOptions.secret,
		// @ts-ignore
		{
			expiresIn: config.jwtOptions.expiresIn
		}

	);
	return token;
}

async function authenticateAdmin(ctx, next) {
	const {
		token
	} = ctx.cookie;
	if (typeof token === "undefined" || token === null) throw new Error(config.errors.NOT_LOGGED_IN);
	const {
		id,
		exp
	} = await verifyToken(token, ctx.userAgent.source);
	const wantedAdmin = await AccountController.getAccountById(id)
	if (wantedAdmin.isLocked === true) throw new Error(config.errors.ACCOUNT.LOCKED_ACCOUNT);
	if (wantedAdmin.type !== config.accountTypes[2]) throw new Error(config.errors.PERMISSION_DENIED);
	if (exp - Math.floor(Date.now() / 1000) < config.jwtOptions.expiresIn / 2) ctx.cookies.set("token", await authenticate(wantedAdmin._id, ctx.userAgent), {
		// @ts-ignore
		expires: new Date(Date.now() + ((config.jwtOptions.expiresIn * 1000) * 2)),
		overwrite: true
	});
	await next();
}

async function isLoggedIn(ctx, next) {
	const token = ctx.cookie.token;
	if (typeof token === "undefined" || token === null) throw new Error(config.errors.NOT_LOGGED_IN);
	await next();
}

async function isLocked(ctx, next) {
	const token = ctx.cookie.token;
	if (typeof token === "undefined" || token === null) throw new Error(config.errors.NOT_LOGGED_IN);
	const loggedInUser = await AccountController.getAccountById(ctx.cookie.userId);
	if (loggedInUser.isLocked) throw new Error(config.errors.ACCOUNT.LOCKED_ACCOUNT);
	await next();
}

async function generateHash(data) {
	return crypto.createHash(config.hashAlgorithm).update(data).digest("hex");
}

async function generatePasswordHash(password, salt) {
	return bcrypt.hash(password, salt);
}

export default {
	authenticate,
	authenticateAdmin,
	isLoggedIn,
	isLocked,
	validate,
	generatePagePath,
	generateHash,
	generatePasswordHash,
	comparePassword,
	sendMail,
	publishCourse,
	updateCourse,
	deleteCourse,
	addWeekly,
	deleteWeekly
};
