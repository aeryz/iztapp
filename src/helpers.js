import config from "./config";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";

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

async function generateHash(data) {
	return crypto.createHash(config.hashAlgorithm).update(data).digest("hex");
}

async function generatePasswordHash(password, salt) {
	return bcrypt.hash(password, salt);
}


export default {
	validate,
	generateHash,
	generatePasswordHash,
};
