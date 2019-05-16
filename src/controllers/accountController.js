import Account from "../models/account";
import DatabaseController from "./databaseController";
import config from "../config";
import helpers from "../helpers";

const AccountController = (() => ({

	async getAccounts(limit = 0, skip = 0, accountType = 0) {
		// validate accountType parameter
		accountType = +accountType;
		if (Number.isNaN(accountType) || !config.accountTypes.includes(accountType) || Math.floor(accountType) !== accountType) throw new Error(config.errors.INVALID_ACCOUNT_TYPE);

		return DatabaseController.find("account", limit, skip, {
			type: accountType
		});
	},

	async getAccountById(id) {
		// validate id
		if (typeof id === "undefined" || id === null) throw new Error(config.errors.UNFILLED_REQUIREMENTS);
		id += "";
		await helpers.validate(id, "id");

		// get wanted entity
		const wantedEntity = await DatabaseController.findOne({ _id: id }).exec();

		if (typeof wantedEntity === "undefined" || wantedEntity === null) throw new Error(config.errors.RECORD_NOT_FOUND);
		return wantedEntity;
	},

	async add(entity) {
		// validate entity
		if (typeof entity === "undefined" || entity === null || typeof entity.email === "undefined" || entity.email === null || typeof entity.password === "undefined" || entity.password === null || typeof entity.type === "undefined" || entity.type === null) throw new Error(config.errors.UNFILLED_REQUIREMENTS);

		// validate email
		entity.email += "";
		if (entity.email.length < config.limits.account.minEMailLength || entity.email.length > config.limits.account.maxEMailLength) throw new Error(config.errors.EMAIL_VALIDATION);
		await helpers.validate(entity.email, "email");

		// validate password
		entity.password += "";
		if (entity.password.length < config.limits.account.minPasswordLength || entity.password.length > config.limits.account.maxPasswordLength) throw new Error(config.errors.PASSWORD_VALIDATION);

		// validate type
		entity.type = +entity.type
		if (Number.isNaN(entity.type) || !config.accountTypes.includes(entity.type) || Math.floor(entity.type) !== entity.type) throw new Error(config.errors.INVALID_ACCOUNT_TYPE);

		const now = new Date().toISOString();

		// generate salt
		const salt = Math.floor(Math.random() * (config.maxSalt - config.minSalt)) + config.minSalt
		entity.salt = salt;

		// encrypt password
		entity.password = await helpers.generatePasswordHash(entity.password, entity.salt);

		// set bad login count
		entity.badLoginCount = 0;

		// set is locked
		entity.isLocked = false;

		// generate unlock hash
		entity.unlockHash = await helpers.generateHash(`(${Math.random()})${entity.email}/Unlock@${now}(${Math.random()})`);

		// set last login date
		entity.lastLoginDate = null;

		// set creation date
		entity.creationDate = now;

		return DatabaseController.add("account", entity);
	}


}))();

export default AccountController;
