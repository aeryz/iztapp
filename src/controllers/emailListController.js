import Email from "./emailController";
import DatabaseController from "./databaseController";
import config from "../config";
import helpers from "../helpers";

const EmailListController = (() => ({

	async getEmailLists(limit = 0, skip = 0) {
		return DatabaseController.find("emailList", limit, skip);
	},

	async getEmailListById(id) {
		// validate id
		if (typeof id === "undefined" || id === null) throw new Error(config.errors.UNFILLED_REQUIREMENTS);
		id += "";
		await helpers.validate(id, "id");

		// get wanted entity
		const wantedEntity = await DatabaseController.findOneByQuery("emailList", { _id: id });

		return wantedEntity;
	},

	async add(entity) {
		// validate entity
		if (typeof entity === "undefined" || entity === null || typeof entity.name === "undefined" || entity.name === null) throw new Error(config.errors.UNFILLED_REQUIREMENTS);

		// validate name
		entity.name += "";
		if (entity.name.length < config.limits.emailList.minNameLength || entity.name.length > config.limits.emailList.maxNameLength) throw new Error(config.errors.EMAIL_LIST_NAME_VALIDATION);

		const now = new Date().toISOString();

		// set creation date
		entity.creationDate = now;

		const newEntity = await DatabaseController.add("emailList", entity);

		return newEntity;
	},

	async update(entity) {
		// validate entity
		if (typeof entity === "undefined" || entity === null || typeof entity.id === "undefined" || entity.id === null || typeof entity.name === "undefined" || entity.name === null) throw new Error(config.errors.UNFILLED_REQUIREMENTS);

		// validate id
		if (typeof entity.id === "undefined" || entity.id === null) throw new Error(config.errors.UNFILLED_REQUIREMENTS);
		entity.id += "";
		await helpers.validate(entity.id, "id");

		// validate name
		entity.name += "";
		if (entity.name.length < config.limits.emailList.minNameLength || entity.name.length > config.limits.emailList.maxNameLength) throw new Error(config.errors.EMAIL_LIST_NAME_VALIDATION);

		const wantedEntity = await this.getEmailListById(entity.id);

		wantedEntity.name = entity.name;

		const updatedEntity = await DatabaseController.update("emailList", wantedEntity);

		return updatedEntity;
	},

	async delete(id) {
		return DatabaseController.delete("emailList", {
			_id: id
		});
	},

	async addEmailToList(emailId, emailListId) {
		// validate email id
		if (typeof emailId === "undefined" || emailId === null) throw new Error(config.errors.UNFILLED_REQUIREMENTS);
		emailId += "";
		await helpers.validate(emailId, "id");

		// validate email list id
		if (typeof emailListId === "undefined" || emailListId === null) throw new Error(config.errors.UNFILLED_REQUIREMENTS);
		emailListId += "";
		await helpers.validate(emailListId, "id");

		const wantedEmail = await DatabaseController.findOneByQuery("email", { _id: emailId });
		const wantedEmailList = await this.getEmailListById(emailListId);

		if (wantedEmailList.emails.includes(wantedEmail._id)) throw new Error(config.errors.EMAIL_ALREADY_ADDED)

		wantedEmailList.emails.push(wantedEmail._id);

		const updatedEntity = await DatabaseController.update("emailList", wantedEmailList);

		return updatedEntity;
	},

	async removeEmailFromList(emailId, emailListId) {
		// validate email id
		if (typeof emailId === "undefined" || emailId === null) throw new Error(config.errors.UNFILLED_REQUIREMENTS);
		emailId += "";
		await helpers.validate(emailId, "id");

		// validate email list id
		if (typeof emailListId === "undefined" || emailListId === null) throw new Error(config.errors.UNFILLED_REQUIREMENTS);
		emailListId += "";
		await helpers.validate(emailListId, "id");

		const wantedEmail = await DatabaseController.findOneByQuery("email", { _id: emailId });
		const wantedEmailList = await this.getEmailListById(emailListId);

		if (!wantedEmailList.emails.includes(wantedEmail._id)) throw new Error(config.errors.EMAIL_NOT_IN_LIST);

		wantedEmailList.emails.splice(wantedEmailList.emails.indexOf(wantedEmail._id), 1);

		const updatedEntity = await DatabaseController.update("emailList", wantedEmailList);

		return updatedEntity;
	}


}))();

export default EmailListController;
