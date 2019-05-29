import DatabaseController from "./databaseController";
import config from "../config";

const EmailController = (() => ({

	async getEmails(limit = 0, skip = 0) {
		return DatabaseController.find("email", limit, skip);
	},

	async add(entity) {
		// validate entity
		if (typeof entity === "undefined" || entity === null || typeof entity.email === "undefined" || entity.email === null) throw new Error(config.errors.UNFILLED_REQUIREMENTS);

		const newEntity = await DatabaseController.add("email", entity);

		return newEntity;
	},

	async delete(id) {
		return DatabaseController.delete("email", {
			_id: id
		});
	},

}))();

export default EmailController;
