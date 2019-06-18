import DatabaseController from "./databaseController";
import config from "../config";
import helpers from "../helpers";
import EmailController from "./emailController";

const EmailListController = (() => ({

	async getEmailLists(limit = 0, skip = 0) {
		const wantedEmailLists = await DatabaseController.find("emailList", limit, skip);
		return wantedEmailLists;
	},

	async getEmailListById(id) {
		// validate id
		if (typeof id === "undefined" || id === null) throw new Error(config.errors.MISSING_PARAMETER);
		id += "";
		await helpers.validate(id, "id");

		// get wanted entity
		const wantedEntity = await DatabaseController.findOneByQuery("emailList", { _id: id });

		return wantedEntity;
	},

	async add(entity) {
		// validate entity
		if (typeof entity === "undefined" || entity === null || typeof entity.name === "undefined" || entity.name === null) throw new Error(config.errors.MISSING_PARAMETER);

		// validate name
		entity.name += "";
		if (entity.name.length < config.limits.emailList.minNameLength || entity.name.length > config.limits.emailList.maxNameLength) throw new Error(config.errors.EMAIL_LIST.VALIDATION.INVALID_NAME);

		const now = new Date().toISOString();

		// set creation date
		entity.creationDate = now;

		const newEntity = await DatabaseController.add("emailList", entity);

		return newEntity;
	},

	async update(id, entity) {
		// validate entity
		if (typeof entity === "undefined" || entity === null || typeof id === "undefined" || id === null || typeof entity.name === "undefined" || entity.name === null) throw new Error(config.errors.MISSING_PARAMETER);

		// validate id
		id += "";
		await helpers.validate(id, "id");

		// validate name
		entity.name += "";
		if (entity.name.length < config.limits.emailList.minNameLength || entity.name.length > config.limits.emailList.maxNameLength) throw new Error(config.errors.EMAIL_LIST.VALIDATION.INVALID_NAME);

		const wantedEntity = await this.getEmailListById(id);

		wantedEntity.name = entity.name;

		const updatedEntity = await DatabaseController.update("emailList", wantedEntity);

		return updatedEntity;
	},

	async delete(id) {
		if (typeof id === "undefined" || id === null) throw new Error(config.errors.MISSING_PARAMETER);
		const deleteResult = await DatabaseController.delete("emailList", {
			_id: id
		});
		return deleteResult;
	},

	async addEmailToList(emailId, emailListId) {
		if (typeof emailId === "undefined" || emailId === null || typeof emailListId === "undefined" || emailListId === null) throw new Error(config.errors.MISSING_PARAMETER);

		// validate id's
		emailId += "";
		await helpers.validate(emailId, "id");
		emailListId += "";
		await helpers.validate(emailListId, "id");

		const wantedEmail = await DatabaseController.findOneByQuery("email", { _id: emailId });
		const wantedEmailList = await this.getEmailListById(emailListId);

		if (wantedEmailList.emails.includes(wantedEmail._id)) throw new Error(config.errors.EMAIL_LIST.ALREADY_ADDED);

		wantedEmailList.emails.push(wantedEmail._id);

		const updatedEntity = await DatabaseController.update("emailList", wantedEmailList);

		return updatedEntity;
	},

	async removeEmailFromList(emailId, emailListId) {
		if (typeof emailId === "undefined" || emailId === null || typeof emailListId === "undefined" || emailListId === null) throw new Error(config.errors.MISSING_PARAMETER);

		// validate ids
		emailId += "";
		await helpers.validate(emailId, "id");
		emailListId += "";
		await helpers.validate(emailListId, "id");

		const wantedEmail = await DatabaseController.findOneByQuery("email", { _id: emailId });
		const wantedEmailList = await this.getEmailListById(emailListId);

		const wantedEmailId = wantedEmail._id + "";
		const wantedEmailListEmails = wantedEmailList.emails.map(email => email + "");

		if (!wantedEmailListEmails.includes(wantedEmailId)) throw new Error(config.errors.EMAIL_LIST.NOT_IN_LIST);

		// Remove email
		wantedEmailList.emails.splice(wantedEmailList.emails.indexOf(wantedEmail._id), 1);

		const updatedEntity = await DatabaseController.update("emailList", wantedEmailList);

		return updatedEntity;
	},

	async importEmailList(entity) {
		// validate entity
		if (typeof entity === "undefined" || entity === null || typeof entity.name === "undefined" || entity.name === null || typeof entity.emails === "undefined" || entity.emails === null) throw new Error(config.errors.MISSING_PARAMETER);

		// validate name
		entity.name += "";
		if (entity.name.length < config.limits.emailList.minNameLength || entity.name.length > config.limits.emailList.maxNameLength) throw new Error(config.errors.EMAIL_LIST.VALIDATION.INVALID_NAME);

		const now = new Date().toISOString();

		// set creation date
		entity.creationDate = now;

		const newEntity = await DatabaseController.add("emailList", entity);

		for (let i = 0; i < entity.emails.length; i++) {
			const email = entity.emails[i] + "";
			await helpers.validate(email, "email");
			const newEmail = await EmailController.add({ email: email });
			await this.addEmailToList(newEntity._id, newEmail._id);
		}

		const wantedEntity = await this.getEmailListById(newEntity._id);
		return wantedEntity;
	}


}))();

export default EmailListController;
