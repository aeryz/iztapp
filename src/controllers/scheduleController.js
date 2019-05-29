import DatabaseController from "./databaseController";
import config from "../config";
import helpers from "../helpers";

const ScheduleController = (() => ({

	async getWeeklySchedules(limit = 0, skip = 0, query) {
		return DatabaseController.find("weeklySchedule", limit, skip, query);
	},

	async getWeeklySchedule(query) {
		return DatabaseController.findOneByQuery("weeklySchedule", query);
	},

	async getDailySchedules(limit = 0, skip = 0, query) {
		return DatabaseController.find("dailySchedule", limit, skip, query);
	},

	async getDailySchedule(query) {
		return DatabaseController.findOneByQuery("dailySchedule", query);
	},

	async addWeeklySchedule(entity) {
		// validate entity
		if (typeof entity === "undefined" || entity === null || typeof entity.semester === "undefined" || entity.semester === null || typeof entity.type === "undefined" || entity.type === null) throw new Error(config.errors.UNFILLED_REQUIREMENTS);

		// validate semester
		entity.semester = +entity.semester
		if (entity.semester < config.limits.weeklySchedule.minSemesterNumber || entity.semester > config.limits.weeklySchedule.maxSemesterNumber) throw new Error(config.errors.INVALID_SEMESTER);

		// validate type
		entity.type = +entity.type
		if (Number.isNaN(entity.type) || !config.scheduleTypes.includes(entity.type) || Math.floor(entity.type) !== entity.type) throw new Error(config.errors.INVALID_SCHEDULE_TYPE);

		const now = new Date().toISOString();

		entity.creationDate = now;

		entity.days = []

		const newEntity = await DatabaseController.add("weeklySchedule", entity);

		return newEntity;

	},

	async updateWeeklySchedule(id, entity) {
		// validate entity
		if (typeof entity === "undefined" || entity === null || typeof entity.semester === "undefined" || entity.semester === null || typeof entity.type === "undefined" || entity.type === null) throw new Error(config.errors.UNFILLED_REQUIREMENTS);

		// validate semester
		entity.semester = +entity.semester
		if (entity.semester < config.limits.weeklySchedule.minSemesterNumber || entity.semester > config.limits.weeklySchedule.maxSemesterNumber) throw new Error(config.errors.INVALID_SEMESTER);

		// validate type
		entity.type = +entity.type
		if (Number.isNaN(entity.type) || !config.scheduleTypes.includes(entity.type) || Math.floor(entity.type) !== entity.type) throw new Error(config.errors.INVALID_SCHEDULE_TYPE);

		const wantedEntity = await this.getWeeklySchedule({ _id: id });

		wantedEntity.semester = entity.semester;

		wantedEntity.type = entity.type;

		const updatedEntity = await DatabaseController.update("weeklySchedule", wantedEntity);

		return updatedEntity;
	},

	async deleteWeeklySchedule(id) {
		return await DatabaseController.delete("weeklySchedule", { _id: id })
	},

	async addDailySchedule(entity) {
		// validate entity
		if (typeof entity === "undefined" || entity === null || typeof entity.type === "undefined" || entity.type === null) throw new Error(config.errors.UNFILLED_REQUIREMENTS);

		// validate type
		entity.type = +entity.type
		if (Number.isNaN(entity.type) || !config.scheduleTypes.includes(entity.type) || Math.floor(entity.type) !== entity.type) throw new Error(config.errors.INVALID_SCHEDULE_TYPE);

		const now = new Date().toISOString();

		entity.creationDate = now;

		const newEntity = await DatabaseController.add("dailySchedule", entity);

		return newEntity;
	},

	async updateDailySchedule(id, entity) {
		// validate entity
		if (typeof entity === "undefined" || entity === null || typeof entity.day === "undefined" || entity.day === null || typeof entity.type === "undefined" || entity.type === null) throw new Error(config.errors.UNFILLED_REQUIREMENTS);

		// validate day
		entity.day = +entity.day
		if (entity.semester < config.limits.dailySchedule.minDayNumber || entity.semester > config.limits.dailySchedule.maxDayNumber) throw new Error(config.errors.INVALID_DAY_NUMBER);

		// validate type
		entity.type = +entity.type
		if (Number.isNaN(entity.type) || !config.scheduleTypes.includes(entity.type) || Math.floor(entity.type) !== entity.type) throw new Error(config.errors.INVALID_SCHEDULE_TYPE);

		const wantedEntity = await this.getDailySchedule({ _id: id });

		wantedEntity.day = entity.day;

		wantedEntity.type = entity.type;

		const updatedEntity = await DatabaseController.update("dailySchedule", wantedEntity);

		return updatedEntity;
	},

	async deleteDailySchedule(id) {
		return await DatabaseController.delete("dailySchedule", { _id: id })
	},

	async assignDailyToWeekly(weeklyScheduleId, dailyScheduleId, day) {
		// validate weeklyScheduleId
		if (typeof weeklyScheduleId === "undefined" || weeklyScheduleId === null) throw new Error(config.errors.UNFILLED_REQUIREMENTS);
		weeklyScheduleId += "";
		await helpers.validate(weeklyScheduleId, "id");

		// validate dailyScheduleId
		if (typeof dailyScheduleId === "undefined" || dailyScheduleId === null) throw new Error(config.errors.UNFILLED_REQUIREMENTS);
		dailyScheduleId += "";
		await helpers.validate(dailyScheduleId, "id");

		// validate day
		if (day < config.limits.weeklyScheule.minDayNumber || day > config.limits.weeklyScheule.maxDayNumber) throw new Error(config.errors.INVALID_DAY_NUMBER)

		const wantedWeeklySchedule = await this.getWeeklySchedule({ _id: weeklyScheduleId });

		const wantedDailySchedule = await this.getDailySchedule({ _id: dailyScheduleId });

		if (wantedWeeklySchedule.type !== wantedDailySchedule.type) throw new Error(config.errors.SCHEDULE_TYPE_MISMATCH);

		if (typeof wantedWeeklySchedule.days[day] === "undefined" || wantedWeeklySchedule.days[day] === null) wantedWeeklySchedule.days[day] = dailyScheduleId;

		else {
			const deletedDailyScheduleId = wantedWeeklySchedule.days[day];
			wantedWeeklySchedule.days[day] = dailyScheduleId;
			if (deletedDailyScheduleId !== dailyScheduleId) await this.deleteDailySchedule(deletedDailyScheduleId);
		}

		const updatedWeeklySchedule = await DatabaseController.update("weeklySchedule", wantedDailySchedule);
	},

	async removeDailyFromWeekly(weeklyScheduleId, dailyScheduleId, day) { },

}))();

export default ScheduleController;
