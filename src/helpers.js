import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";
import AccountController from "./controllers/accountController";

import bluebird from "bluebird";
import jsonwebtoken from "jsonwebtoken";
const { promisify } = bluebird;
const jwt = {
	sign: promisify(jsonwebtoken.sign),
	verify: promisify(jsonwebtoken.verify)
};

import config from "./config";

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

async function comparePassword(password, hash) {

	return bcrypt.compare(password, hash);

};

async function verifyToken(token, userAgent) {

	try {

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
	const token = await jwt.sign(

		{

			t: encryptedId,

			h: finalUserAgentHash

		},

		config.jwtOptions.secret,

		{

			expiresIn: config.jwtOptions.expiresIn

		}

	);

	return token;

}

async function authenticateAdmin(ctx) {

	const { token } = ctx.cookie;

	if (typeof token === "undefined" || token === null) throw new Error(config.errors.PERMISSION_DENIED);

	const { id, exp } = await verifyToken(token, ctx.userAgent.source);

	const wantedAdmin = await AccountController.getAccountById(id)

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
	authenticate,
	authenticateAdmin,
	comparePassword,
	validate,
	generateHash,
	generatePasswordHash,
};
