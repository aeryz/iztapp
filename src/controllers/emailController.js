import DatabaseController from "./databaseController";
import config from "../config";
import helpers from "../helpers";

const EmailController = (() => ({

	async getEmails(limit = 0, skip = 0) {
		const wantedEmails = await DatabaseController.find("email", limit, skip);
		return wantedEmails;
	},

	async add(entity) {
		// validate entity
		if (typeof entity === "undefined" || entity === null || typeof entity.email === "undefined" || entity.email === null) throw new Error(config.errors.MISSING_PARAMETER);

		entity.email += "";
		if (entity.email.length < config.limits.email.minEmailLength || entity.email.length > config.limits.email.maxEmailLength) throw new Error(config.errors.EMAIL.VALIDATION.INVALID_EMAIL);
		await helpers.validate(entity.email, "email");

		const newEntity = await DatabaseController.add("email", entity);

		return newEntity;
	},

	async delete(id) {
		if (typeof id === "undefined" || id === null) throw new Error(config.errors.MISSING_PARAMETER);
		const deleteResult = await DatabaseController.delete("email", {
			_id: id
		});
		return deleteResult;
	},

}))();

export default EmailController;
