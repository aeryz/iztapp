import config from "./config";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Account from "./models/account";

async function validate(data, type, noError = false) {
	try {
		switch (type) {
			case "id": {
				data += "";
				const lengthOfData = data.length;
				let isValid = false;
				if (lengthOfData === 12 || lengthOfData === 24) isValid = (/^[0-9a-fA-F]+$/).test(data);
				if (!isValid) throw new Error(config.errors.INVALID_ID);
				break;
			}
			case "email": {
				if (!validator.isEmail(data)) throw new Error(config.errors.INVALID_EMAIL);
				break;
			}
			case "supportedLang": {
				if (!config.supportedLangs.includes(data)) throw new Error(config.errors.UNSUPPORTED_LANG);
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
				throw new Error("Invalid validation type");
			}
		}
		return true;
	} catch (err) {
		if (noError === true) return false;
		throw err;
	};
};

async function notLoggedInFromCookie(ctx, next) {

    if (!(typeof ctx.cookie.token === "undefined" || ctx.cookie.token === null)) await ctx.redirect(`/${ctx.cookie.lang}`);

    else await next();

}

async function authenticateAdmin(ctx) {
	const { token } = ctx.cookie;

  if (typeof token === "undefined" || token === null) throw new Error(config.errors.PERMISSION_DENIED);

	const { id, exp } = await verifyToken(token, ctx.userAgent.source);

  const wantedAdmin = await Accounts.findOneById(id);

  if (wantedAdmin.isLocked === true) throw new Error(config.errors.LOCKED_ACCOUNT);
	if (wantedAdmin.accountType !== config.accountTypes[2])
		throw new Error(config.errors.NOT_PERMITTED);

	ctx.state.admin = wantedAdmin;

	if (exp - Math.floor(Date.now() / 1000) < config.jwtOptions.expiresIn / 2) ctx.cookies.set("token", await authenticate(wantedAdmin._id, ctx.userAgent), {

      // @ts-ignore
    expires: new Date(Date.now() + ((config.jwtOptions.expiresIn * 1000) * 2)),

    overwrite: true

	});
}

async function generateHash(data) {
	return crypto.createHash(config.hashAlgorithm).update(data).digest("hex");
}

async function generatePasswordHash(password, salt) {
	return bcrypt.hash(password, salt);
}

export default {
	authenticateAdmin,
	notLoggedInFromCookie,
	validate,
	generateHash,
	generatePasswordHash,
};
