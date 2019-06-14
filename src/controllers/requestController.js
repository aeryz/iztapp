import DatabaseController from "./databaseController";
import config from "../config";
import helpers from "../helpers";
import AccountController from "./accountController";
import CourseController from "./courseController";

const RequestController = (() => ({

	async getRequests(limit = 0, skip = 0) {
		const wantedRequests = await DatabaseController.find("request", limit, skip);
		return wantedRequests;
	},

	async getRequestById(id) {
		// validate id
		if (typeof id === "undefined" || id === null) throw new Error(config.errors.MISSING_PARAMETER);
		id += "";
		await helpers.validate(id, "id");

		// get wanted entity
		const wantedEntity = await DatabaseController.findOneByQuery("request", { _id: id });

		return wantedEntity;
	},

	async add(entity) {
		// validate entity
		if (typeof entity === "undefined" || entity === null || typeof entity.createdBy === "undefined" || entity.createdBy === null || typeof entity.type === "undefined" || entity.type === null || typeof entity.body === "undefined" || entity.body === null) throw new Error(config.errors.MISSING_PARAMETER);

		// validate creator
		entity.createdBy += "";
		await helpers.validate(entity.createdBy, "id");
		await AccountController.getAccountById(entity.createdBy);

		// validate type
		entity.type = +entity.type
		if (Number.isNaN(entity.type) || !config.requestTypes.includes(entity.type) || Math.floor(entity.type) !== entity.type) throw new Error(config.errors.REQUEST.VALIDATION.INVALID_TYPE);

		const now = new Date().toISOString();

		entity.status = 0;
		entity.handledBy = null;
		entity.handledDate = null;
		entity.creationDate = now;

		const newEntity = await DatabaseController.add("request", entity);

		return newEntity;
	},

	async delete(id) {
		if (typeof id === "undefined" || id === null) throw new Error(config.errors.MISSING_PARAMETER);
		const deleteResult = await DatabaseController.delete("request", {
			_id: id
		});
		return deleteResult;
	},

	async handleRequest(id, state) {
		if (typeof id === "undefined" || id === null || typeof state === "undefined" || state === null) throw new Error(config.errors.MISSING_PARAMETER);

		// validate id
		id += "";
		await helpers.validate(id, "id");

		state = +state;
		// validate state
		if (Number.isNaN(state) || !config.requestStates.includes(state) || Math.floor(state) !== state) throw new Error(config.errors.REQUEST.VALIDATION.INVALID_STATE);

		if (state === 1) {
			await RequestController.delete(id);
			return true;
		}

		const wantedEntity = await this.getRequestById(id);

		if (wantedEntity.type === 0) {
			wantedEntity.body.courseCreator = 0;
			const newEntity = await CourseController.add(wantedEntity.body);
			await RequestController.delete(id);
			return newEntity;
		}
		else if (wantedEntity.type === 1) {
			wantedEntity.body.courseUpdator = 0;
			const updatedEntity = await CourseController.update(wantedEntity.body.updatedCourseId, wantedEntity.body);
			await RequestController.delete(id);
			return updatedEntity;
		}
		else if (wantedEntity.type === 2) {
			wantedEntity.body.courseDeletor = 0;
			const deleteResult = await CourseController.delete(wantedEntity.body);
			await RequestController.delete(id);
			return deleteResult;
		}

		return false;
	}


}))();

export default RequestController;
