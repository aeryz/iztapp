import DatabaseController from "./databaseController";
import config from "../config";
import helpers from "../helpers";

const ScheduleController = (() => ({

	async getWeeklySchedules(limit = 0, skip = 0, query) {
		const wantedWeeklySchedules = await DatabaseController.find("weeklySchedule", limit, skip, query);
		return wantedWeeklySchedules;
	},

	async getWeeklySchedule(query) {
		const wantedEntity = await DatabaseController.findOneByQuery("weeklySchedule", query);
		return wantedEntity;
	},

	async getDailySchedules(limit = 0, skip = 0, query) {
		const wantedDailySchedules = await DatabaseController.find("dailySchedule", limit, skip, query);
		return wantedDailySchedules;
	},

	async getDailySchedule(query) {
		const wantedEntity = await DatabaseController.findOneByQuery("dailySchedule", query);
		return wantedEntity;
	},

	async addWeeklySchedule(entity) {
		// validate entity
		if (typeof entity === "undefined" || entity === null || typeof entity.semester === "undefined" || entity.semester === null || typeof entity.type === "undefined" || entity.type === null) throw new Error(config.errors.MISSING_PARAMETER);

		// validate semester
		entity.semester = +entity.semester
		if (entity.semester < config.limits.weeklySchedule.minSemesterNumber || entity.semester > config.limits.weeklySchedule.maxSemesterNumber) throw new Error(config.errors.WEEKLY_SCHEDULE.VALIDATION.INVALID_SEMESTER);

		// validate type
		entity.type = +entity.type
		if (Number.isNaN(entity.type) || !config.scheduleTypes.includes(entity.type) || Math.floor(entity.type) !== entity.type) throw new Error(config.errors.WEEKLY_SCHEDULE.VALIDATION.INVALID_TYPE);

		const now = new Date().toISOString();
		entity.creationDate = now;
		entity.days = [null, null, null, null, null]

		const newEntity = await DatabaseController.add("weeklySchedule", entity);

		return newEntity;

	},

	async updateWeeklySchedule(id, entity) {
		// validate entity
		if (typeof entity === "undefined" || entity === null || typeof entity.semester === "undefined" || entity.semester === null || typeof entity.type === "undefined" || entity.type === null) throw new Error(config.errors.MISSING_PARAMETER);

		// validate semester
		entity.semester = +entity.semester
		if (entity.semester < config.limits.weeklySchedule.minSemesterNumber || entity.semester > config.limits.weeklySchedule.maxSemesterNumber) throw new Error(config.errors.WEEKLY_SCHEDULE.VALIDATION.INVALID_SEMESTER);

		// validate type
		entity.type = +entity.type
		if (Number.isNaN(entity.type) || !config.scheduleTypes.includes(entity.type) || Math.floor(entity.type) !== entity.type) throw new Error(config.errors.WEEKLY_SCHEDULE.VALIDATION.INVALID_TYPE);

		const wantedEntity = await this.getWeeklySchedule({ _id: id });

		wantedEntity.semester = entity.semester;
		wantedEntity.type = entity.type;

		const updatedEntity = await DatabaseController.update("weeklySchedule", wantedEntity);

		return updatedEntity;
	},

	async deleteWeeklySchedule(id) {
		if (typeof id === "undefined" || id === null) throw new Error(config.errors.MISSING_PARAMETER);
		const deleteResult = await DatabaseController.delete("weeklySchedule", { _id: id });
		return deleteResult;
	},

	async addDailySchedule(entity) {
		// validate entity
		if (typeof entity === "undefined" || entity === null || typeof entity.type === "undefined" || entity.type === null || typeof entity.day === "undefined" || entity.day === null) throw new Error(config.errors.MISSING_PARAMETER);

		// validate type
		entity.type = +entity.type
		if (Number.isNaN(entity.type) || !config.scheduleTypes.includes(entity.type) || Math.floor(entity.type) !== entity.type) throw new Error(config.errors.DAILY_SCHEDULE.VALIDATION.INVALID_TYPE);

		// validate day
		entity.day = +entity.day
		if (entity.semester < config.limits.dailySchedule.minDayNumber || entity.semester > config.limits.dailySchedule.maxDayNumber) throw new Error(config.errors.DAILY_SCHEDULE.VALIDATION.INVALID_DAY);

		const now = new Date().toISOString();
		entity.creationDate = now;

		const newEntity = await DatabaseController.add("dailySchedule", entity);

		return newEntity;
	},

	async updateDailySchedule(id, entity) {
		// validate entity
		if (typeof entity === "undefined" || entity === null || typeof entity.day === "undefined" || entity.day === null || typeof entity.type === "undefined" || entity.type === null) throw new Error(config.errors.MISSING_PARAMETER);

		// validate day
		entity.day = +entity.day
		if (entity.semester < config.limits.dailySchedule.minDayNumber || entity.semester > config.limits.dailySchedule.maxDayNumber) throw new Error(config.errors.DAILY_SCHEDULE.VALIDATION.INVALID_DAY);

		// validate type
		entity.type = +entity.type
		if (Number.isNaN(entity.type) || !config.scheduleTypes.includes(entity.type) || Math.floor(entity.type) !== entity.type) throw new Error(config.errors.DAILY_SCHEDULE.VALIDATION.INVALID_TYPE);

		const wantedEntity = await this.getDailySchedule({ _id: id });

		wantedEntity.day = entity.day;
		wantedEntity.type = entity.type;

		const updatedEntity = await DatabaseController.update("dailySchedule", wantedEntity);

		return updatedEntity;
	},

	// ! TODO: Check if this daily schedule is used in somewhere
	async deleteDailySchedule(id) {
		if (typeof id === "undefined" || id === null) throw new Error(config.errors.MISSING_PARAMETER);
		const deleteResult = await DatabaseController.delete("dailySchedule", { _id: id });
		return deleteResult;
	},

	async assignDailyToWeekly(weeklyScheduleId, dailyScheduleId, day) {
		if (typeof weeklyScheduleId === "undefined" || weeklyScheduleId === null || typeof dailyScheduleId === "undefined" || dailyScheduleId === null || typeof day === "undefined" || day === null) throw new Error(config.errors.MISSING_PARAMETER);

		// validate weeklyScheduleId
		weeklyScheduleId += "";
		await helpers.validate(weeklyScheduleId, "id");

		// validate dailyScheduleId
		dailyScheduleId += "";
		await helpers.validate(dailyScheduleId, "id");

		// validate day
		if (day < config.limits.weeklySchedule.minDayNumber || day > config.limits.weeklySchedule.maxDayNumber) throw new Error(config.errors.WEEKLY_SCHEDULE.VALIDATION.INVALID_DAY);

		const wantedWeeklySchedule = await this.getWeeklySchedule({ _id: weeklyScheduleId });
		const wantedDailySchedule = await this.getDailySchedule({ _id: dailyScheduleId });

		if (wantedWeeklySchedule.type !== wantedDailySchedule.type) throw new Error(config.errors.WEEKLY_SCHEDULE.TYPE_MISMATCH);

		if (typeof wantedWeeklySchedule.days[day] === "undefined" || wantedWeeklySchedule.days[day] === null) wantedWeeklySchedule.days[day] = dailyScheduleId;
		else {
			const removedDailyScheduleId = wantedWeeklySchedule.days[day];
			wantedWeeklySchedule.days[day] = dailyScheduleId;
			if (removedDailyScheduleId !== dailyScheduleId) await this.deleteDailySchedule(removedDailyScheduleId);
		}

		const updatedWeeklySchedule = await DatabaseController.update("weeklySchedule", wantedWeeklySchedule);

		return updatedWeeklySchedule;

	},

	async removeDailyFromWeekly(weeklyScheduleId, day) {
		if (typeof weeklyScheduleId === "undefined" || weeklyScheduleId === null || typeof day === "undefined" || day === null) throw new Error(config.errors.MISSING_PARAMETER);

		// validate id
		weeklyScheduleId += "";
		await helpers.validate(weeklyScheduleId, "id");

		// validate day
		if (day < config.limits.weeklySchedule.minDayNumber || day > config.limits.weeklySchedule.maxDayNumber) throw new Error(config.errors.WEEKLY_SCHEDULE.VALIDATION.INVALID_DAY);

		const wantedEntity = await this.getWeeklySchedule({ _id: weeklyScheduleId });

		if (typeof wantedEntity.days[day] === "undefined" || wantedEntity.days[day] === null)
			throw new Error(config.errors.WEEKLY_SCHEDULE.EMPTY_DAY);

		const deleteDailyScheduleId = wantedEntity.days[day];
		wantedEntity.days[day] = null;
		const deleteResult = await DatabaseController.delete("dailySchedule", { _id: deleteDailyScheduleId });

		if (deleteResult) return wantedEntity;
		else throw new Error(config.errors.DELETE_FAILURE);
	},

}))();

export default ScheduleController;
