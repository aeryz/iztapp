import DatabaseController from "./databaseController";
import config from "../config";
import helpers from "../helpers";

const AccountController = (() => ({

	async getAccounts(limit = 0, skip = 0, accountType = 0) {
		// validate account type
		accountType = +accountType;
		if (Number.isNaN(accountType) || !config.accountTypes.includes(accountType) || Math.floor(accountType) !== accountType) throw new Error(config.errors.ACCOUNT.VALIDATION.INVALID_TYPE);

		// set query
		let query = {};
		if (accountType !== 0) query = { type: accountType };

		// get wanted accounts
		return DatabaseController.find("account", limit, skip, query);
	},

	async getAccountById(id) {
		// validate id
		if (typeof id === "undefined" || id === null) throw new Error(config.errors.MISSING_PARAMETER);
		id += "";
		await helpers.validate(id, "id");

		// get wanted entity
		const wantedEntity = await DatabaseController.findOneByQuery("account", { _id: id });
		return wantedEntity;
	},

	async add(entity) {
		// validate entity
		if (typeof entity === "undefined" || entity === null || typeof entity.email === "undefined" || entity.email === null || typeof entity.password === "undefined" || entity.password === null || typeof entity.type === "undefined" || entity.type === null) throw new Error(config.errors.MISSING_PARAMETER);

		// validate email
		entity.email += "";
		if (entity.email.length < config.limits.account.minEmailLength || entity.email.length > config.limits.account.maxEmailLength) throw new Error(config.errors.ACCOUNT.VALIDATION.INVALID_EMAIL);
		await helpers.validate(entity.email, "email");

		// validate password
		entity.password += "";
		if (entity.password.length < config.limits.account.minPasswordLength || entity.password.length > config.limits.account.maxPasswordLength) throw new Error(config.errors.ACCOUNT.VALIDATION.INVALID_PASSWORD);

		// validate type
		entity.type = +entity.type
		if (Number.isNaN(entity.type) || entity.type === 0 || !config.accountTypes.includes(entity.type) || Math.floor(entity.type) !== entity.type) throw new Error(config.errors.ACCOUNT.VALIDATION.INVALID_TYPE);

		// set other fields
		const now = new Date().toISOString();

		// generate salt
		const salt = Math.floor(Math.random() * (config.maxSalt - config.minSalt)) + config.minSalt
		entity.salt = salt;

		// encrypt password
		entity.password = await helpers.generatePasswordHash(entity.password, entity.salt);

		// set password try counter
		entity.passwordTry = 0;

		// set is locked
		entity.isLocked = false;

		// generate unlock hash
		entity.unlockHash = await helpers.generateHash(`(${Math.random()})${entity.email}/Unlock@${now}(${Math.random()})`);

		// set last login date
		entity.lastLoginDate = null;

		// set creation date
		entity.creationDate = now;

		const newEntity = await DatabaseController.add("account", entity);

		return newEntity;
	},

	async delete(id) {
		if (typeof id === "undefined" || id === null) throw new Error(config.errors.MISSING_PARAMETER);
		const deleteResult = await DatabaseController.delete("account", {
			_id: id
		});
		return deleteResult;
	},

	async login(entity) {
		// validate entity
		if (typeof entity === "undefined" || entity === null || typeof entity.email === "undefined" || entity.email === null || typeof entity.password === "undefined" || entity.password === null) throw new Error(config.errors.MISSING_PARAMETER);

		// validate email
		entity.email += "";
		if (entity.email.length < config.limits.account.minEmailLength || entity.email.length > config.limits.account.maxEmailLength) throw new Error(config.errors.ACCOUNT.VALIDATION.INVALID_EMAIL);
		await helpers.validate(entity.email, "email");

		// validate password
		entity.password += "";
		if (entity.password.length < config.limits.account.minPasswordLength || entity.password.length > config.limits.account.maxPasswordLength) throw new Error(config.errors.ACCOUNT.VALIDATION.INVALID_PASSWORD);

		const wantedEntity = await DatabaseController.findOneByQuery("account", {
			email: entity.email
		});

		// validate lock state
		if (wantedEntity.isLocked) throw new Error(config.errors.ACCOUNT.LOCKED_ACCOUNT);

		// log user in
		if (!await helpers.comparePassword(entity.password, wantedEntity.password)) {
			wantedEntity.passwordTry++;
			await DatabaseController.update("account", wantedEntity);
			if (wantedEntity.passwordTry >= config.limits.account.maxPasswordTry) await this.lockAccount(wantedEntity._id);
			throw new Error(config.errors.ACCOUNT.WRONG_PASSWORD);
		}

		const now = new Date().toISOString();
		wantedEntity.lastLoginDate = now;
		wantedEntity.passwordTry = 0;
		await DatabaseController.update("account", wantedEntity);
		return wantedEntity;
	},

	async lockAccount(id) {
		const wantedEntity = await this.getAccountById(id);

		if (wantedEntity.isLocked === true) throw new Error(config.errors.ACCOUNT.ALREADY_LOCKED);

		wantedEntity.isLocked = true;
		await DatabaseController.update("account", wantedEntity);

		// send email here

		return wantedEntity;
	},

	async unlockAccount(hash) {
		if (typeof hash === "undefined" || hash === null) throw new Error(config.errors.MISSING_PARAMETER);
		const wantedEntity = await DatabaseController.findOneByQuery("account", {
			unlockHash: hash
		});

		if (!wantedEntity.isLocked) throw new Error(config.errors.ACCOUNT.ALREADY_UNLOCKED);

		const now = new Date().toISOString();

		// generate new unlock hash
		wantedEntity.unlockHash = await helpers.generateHash(`(${Math.random()})${wantedEntity.email}/Unlock@${now}(${Math.random()})`);

		// reset locked status
		wantedEntity.isLocked = false;

		// reset password try
		wantedEntity.passwordTry = 0;

		await DatabaseController.update("account", wantedEntity);

		return wantedEntity;
	},

	async updatePassword(id, newPassword) {
		if (typeof newPassword === "undefined" || newPassword === null) throw new Error(config.errors.MISSING_PARAMETER);

		// validate password
		newPassword += "";
		if (newPassword.length < config.limits.account.minPasswordLength || newPassword.length > config.limits.account.maxPasswordLength) throw new Error(config.errors.ACCOUNT.VALIDATION.INVALID_PASSWORD);

		const wantedEntity = await this.getAccountById(id)

		// encrypt password
		wantedEntity.password = await helpers.generatePasswordHash(newPassword, wantedEntity.salt);

		await DatabaseController.update("account", wantedEntity);

		return wantedEntity;
	}


}))();

export default AccountController;
