import DatabaseController from "./databaseController";
import config from "../config";
import helpers from "../helpers";

const RequestController = (() => ({

	async getRequests(limit = 0, skip = 0) {
		return DatabaseController.find("account", limit, skip);
	},

	async getRequestById(id) {
		// validate id
		if (typeof id === "undefined" || id === null) throw new Error(config.errors.UNFILLED_REQUIREMENTS);
		id += "";
		await helpers.validate(id, "id");

		// get wanted entity
		const wantedEntity = await DatabaseController.findOneByQuery("request", { _id: id });

		return wantedEntity;
	},

	async add(entity) {
		// validate entity
		if (typeof entity === "undefined" || entity === null || typeof entity.createdBy === "undefined" || entity.createdBy === null || typeof entity.type === "undefined" || entity.type === null || typeof entity.body === "undefined" || entity.body === null) throw new Error(config.errors.UNFILLED_REQUIREMENTS);

		// validate creator id
		if (typeof entity.createdBy === "undefined" || entity.createdBy === null) throw new Error(config.errors.UNFILLED_REQUIREMENTS);
		entity.createdBy += "";
		await helpers.validate(entity.createdBy, "id");

		// validate type
		entity.type = +entity.type
		if (Number.isNaN(entity.type) || !config.requestTypes.includes(entity.type) || Math.floor(entity.type) !== entity.type) throw new Error(config.errors.INVALID_REQUEST_TYPE);

		// ! TODO: Do validation for body

		const now = new Date().toISOString();

		entity.status = 0; // Pending
		entity.handledBy = null;
		entity.handledDate = null;
		entity.creationDate = now;

		const newEntity = await DatabaseController.add("request", entity);

		return newEntity;
	},

	async delete(id) {
		return DatabaseController.delete("request", {
			_id: id
		});
	},

	async handleRequest(id, state) {
		// validate id
		if (typeof id === "undefined" || id === null) throw new Error(config.errors.UNFILLED_REQUIREMENTS);
		id += "";
		await helpers.validate(id, "id");

		// validate state
		if (Number.isNaN(state) || !config.requestStates.includes(state) || Math.floor(state) !== state) throw new Error(config.errors.INVALID_REQUEST_STATE_TYPE);

		// ! TODO: Do What to do
	}


}))();

export default RequestController;
