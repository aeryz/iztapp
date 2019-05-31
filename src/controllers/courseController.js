import DatabaseController from "./databaseController";
import config from "../config";
import helpers from "../helpers";
import AccountController from "./accountController";

const CourseController = (() => ({

	async getCourses(limit = 0, skip = 0, query) {
		return DatabaseController.find("course", limit, skip, query);
	},

	async getCourse(query) {
		return DatabaseController.findOneByQuery("course", query);
	},

	async add(entity) {
		// validate entity
		if (typeof entity === "undefined" || entity === null || typeof entity.name === "undefined" || entity.name === null || typeof entity.description === "undefined" || entity.description === null || typeof entity.courseCode === "undefined" || entity.courseCode === null || typeof entity.departmentCode === "undefined" || entity.departmentCode === null || typeof entity.topics === "undefined" || entity.topics === null || typeof entity.type === "undefined" || entity.type === null || typeof entity.workers === "undefined" || entity.workers === null || typeof entity.lectureHours === "undefined" || entity.lectureHours === null || typeof entity.labHours === "undefined" || entity.labHours === null || typeof entity.credits === "undefined" || entity.credits === null || typeof entity.ects === "undefined" || entity.ects === null) throw new Error(config.errors.MISSING_PARAMETER);

		// validate name
		entity.name += "";
		if (entity.name.length < config.limits.course.minNameLength || entity.name.length > config.limits.course.maxNameLength) throw new Error(config.errors.COURSE.VALIDATION.INVALID_NAME);

		// validate description
		entity.description += "";
		if (entity.description.length < config.limits.course.minDescriptionLength || entity.description.length > config.limits.course.maxDescriptionLength) throw new Error(config.errors.COURSE.VALIDATION.INVALID_DESCRIPTION);

		// validate course code
		entity.courseCode += "";
		if (entity.courseCode.length < config.limits.course.minCourseCodeLength || entity.courseCode.length > config.limits.course.maxCourseCodeLength) throw new Error(config.errors.COURSE.VALIDATION.INVALID_COURSE_CODE);

		// validate department code
		entity.departmentCode += "";
		if (entity.departmentCode.length < config.limits.course.minDepartmentCodeLength || entity.departmentCode.length > config.limits.course.maxDepartmentCodeLength) throw new Error(config.errors.COURSE.VALIDATION.INVALID_DEPARTMENT_CODE);

		// validate type
		entity.type = +entity.type
		if (Number.isNaN(entity.type) || !config.scheduleTypes.includes(entity.type) || Math.floor(entity.type) !== entity.type) throw new Error(config.errors.COURSE.VALIDATION.INVALID_TYPE);

		// validate lecture hours
		entity.lectureHours = +entity.lectureHours;
		if (entity.lectureHours < config.limits.course.minLectureHours || entity.lectureHours > config.limits.course.maxLectureHours) throw new Error(config.errors.COURSE.VALIDATION.INVALID_LECTURE_HOURS);

		// validate lab hours
		entity.labHours = +entity.labHours;
		if (entity.labHours < config.limits.course.minLabHours || entity.labHours > config.limits.course.maxLabHours) throw new Error(config.errors.COURSE.VALIDATION.INVALID_LAB_HOURS);

		// validate credits
		entity.credits = +entity.credits;
		if (entity.credits < config.limits.course.minCredits || entity.credits > config.limits.course.maxCredits) throw new Error(config.errors.COURSE.VALIDATION.INVALID_CREDITS);

		// validate ects
		entity.ects = +entity.ects;
		if (entity.ects < config.limits.course.minEcts || entity.ects > config.limits.course.maxEcts) throw new Error(config.errors.COURSE.VALIDATION.INVALID_ECTS);

		// generate page path
		entity.pagePath = await helpers.generatePagePath(entity.courseCode);

		const now = new Date().toISOString();

		// set creation date
		entity.creationDate = now;

		const courseCreator = await AccountController.getAccountById(entity.courseCreator);

		if (+courseCreator.type === 1) { }
		else { }

		const newEntity = await DatabaseController.add("course", entity);

		return newEntity;
	},

	async update(entity) { },

	async delete(id) {
		return DatabaseController.delete("course", {
			_id: id
		});
	},

	async publishCourse(id) { }


}))();

export default CourseController;
