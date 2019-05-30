import DatabaseController from "./databaseController";
import config from "../config";
import helpers from "../helpers";

const CourseController = (() => ({

	async getCourses(limit = 0, skip = 0, query) {
		return DatabaseController.find("course", limit, skip, query);
	},

	async getCourse(query) {
		return DatabaseController.findOneByQuery("course", query);
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
		return DatabaseController.delete("account", {
			_id: id
		});
	},

	async login(entity) {
		// validate entity
		if (typeof entity === "undefined" || entity === null || typeof entity.email === "undefined" || entity.email === null || typeof entity.password === "undefined" || entity.password === null) throw new Error(config.errors.UNFILLED_REQUIREMENTS);

		// validate email
		entity.email += "";
		if (entity.email.length < config.limits.account.minEmailLength || entity.email.length > config.limits.account.maxEMailLength) throw new Error(config.errors.EMAIL_VALIDATION);
		await helpers.validate(entity.email, "email");

		// validate password
		entity.password += "";
		if (entity.password.length < config.limits.account.minPasswordLength || entity.password.length > config.limits.account.maxPasswordLength) throw new Error(config.errors.PASSWORD_VALIDATION);

		const wantedEntity = await DatabaseController.findOneByQuery("account", {
			email: entity.email
		});

		if (wantedEntity.isLocked) throw new Error(config.errors.LOCKED_ACCOUNT);

		const now = new Date().toISOString();

		if (!await helpers.comparePassword(entity.password, wantedEntity.password)) {
			wantedEntity.passwordTry++;

			await DatabaseController.update("account", wantedEntity);

			if (wantedEntity.passwordTry >= config.limits.account.maxPasswordTry) await this.lockAccount(wantedEntity._id);
			throw new Error(config.errors.WRONG_PASSWORD);
		}

		wantedEntity.lastLoginDate = now;
		wantedEntity.passwordTry = 0;

		await DatabaseController.update("account", wantedEntity);

		return wantedEntity;
	},

	async lockAccount(id) {
		const wantedEntity = await this.getAccountById(id);

		if (wantedEntity.isLocked === true) throw new Error(config.errors.ALREADY_LOCKED);

		// set as locked
		wantedEntity.isLocked = true;

		await DatabaseController.update("account", wantedEntity);

		// send email here

		return wantedEntity;
	},

	async unlockAccount(hash) {
		const wantedEntity = await DatabaseController.findOneByQuery("account", {
			unlockHash: hash
		});

		if (!wantedEntity.isLocked) throw new Error(config.errors.ALREADY_UNLOCKED);

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
		if (typeof newPassword === "undefined" || newPassword === null) throw new Error(config.errors.UNFILLED_REQUIREMENTS);

		// validate password
		newPassword += "";
		if (newPassword.length < config.limits.account.minPasswordLength || newPassword.length > config.limits.account.maxPasswordLength) throw new Error(config.errors.PASSWORD_VALIDATION);

		const wantedEntity = await this.getAccountById(id)

		// encrypt password
		wantedEntity.password = await helpers.generatePasswordHash(newPassword, wantedEntity.salt);

		await DatabaseController.update("account", wantedEntity);

		return wantedEntity;
	}


}))();

export default CourseController;