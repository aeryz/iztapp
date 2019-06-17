import DatabaseController from "./databaseController";
import config from "../config";
import helpers from "../helpers";
import AccountController from "./accountController";
import RequestController from "./requestController";

const CourseController = (() => ({

	async getCourses(limit = 0, skip = 0, query) {
		const wantedCourses = await DatabaseController.find("course", limit, skip, query);
		return wantedCourses;
	},

	async getCourse(query) {
		const wantedCourse = await DatabaseController.findOneByQuery("course", query);
		return wantedCourse;
	},

	async add(entity) {
		// validate entity
		if (typeof entity === "undefined" || entity === null || typeof entity.name === "undefined" || entity.name === null || typeof entity.description === "undefined" || entity.description === null || typeof entity.courseCode === "undefined" || entity.courseCode === null || typeof entity.departmentCode === "undefined" || entity.departmentCode === null || typeof entity.topics === "undefined" || entity.topics === null || typeof entity.type === "undefined" || entity.type === null || typeof entity.workers === "undefined" || entity.workers === null || typeof entity.lectureHours === "undefined" || entity.lectureHours === null || typeof entity.labHours === "undefined" || entity.labHours === null || typeof entity.credits === "undefined" || entity.credits === null || typeof entity.ects === "undefined" || entity.ects === null || typeof entity.prerequisites === "undefined" || entity.prerequisites === null) throw new Error(config.errors.MISSING_PARAMETER);

		// validate name
		entity.name += "";
		if (entity.name.length < config.limits.course.minNameLength || entity.name.length > config.limits.course.maxNameLength) throw new Error(config.errors.COURSE.VALIDATION.INVALID_NAME);

		// validate description
		entity.description += "";
		if (entity.description.length < config.limits.course.minDescriptionLength || entity.description.length > config.limits.course.maxDescriptionLength) throw new Error(config.errors.COURSE.VALIDATION.INVALID_DESCRIPTION);

		// validate course code
		entity.courseCode += "";
		if (entity.courseCode.length < config.limits.course.minCourseCodeLength || entity.courseCode.length > config.limits.course.maxCourseCodeLength) throw new Error(config.errors.COURSE.VALIDATION.INVALID_COURSE_CODE);
		let duplicated = null;
		try {
			duplicated = await this.getCourse({
				courseCode: entity.courseCode
			});
		} catch {}
		if (!(typeof duplicated === "undefined" || duplicated === null)) throw new Error(config.errors.COURSE.DUPLICATION);


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

		entity.topics = entity.topics + "";
		entity.topics = entity.topics.split(",");
		entity.topics = entity.topics.map(topic => topic.trim());

		const now = new Date().toISOString();

		// set creation date
		entity.creationDate = now;

		let courseCreator;

		if (entity.courseCreator === 0) courseCreator = {
			type: 2
		}
		else courseCreator = await AccountController.getAccountById(entity.courseCreator);

		let newEntity;
		if (+courseCreator.type === 2) {
			newEntity = await DatabaseController.add("course", entity);
			helpers.publishCourse(newEntity);
		} else {
			const requestEntity = {
				body: entity,
				type: 0,
				createdBy: courseCreator._id
			};
			newEntity = await RequestController.add(requestEntity);
		}
		return newEntity;
	},

	async update(id, entity) {
		// validate entity
		if (typeof entity === "undefined" || entity === null || typeof id === "undefined" || id === null || typeof entity.name === "undefined" || entity.name === null || typeof entity.description === "undefined" || entity.description === null || typeof entity.courseCode === "undefined" || entity.courseCode === null || typeof entity.departmentCode === "undefined" || entity.departmentCode === null || typeof entity.topics === "undefined" || entity.topics === null || typeof entity.type === "undefined" || entity.type === null || typeof entity.workers === "undefined" || entity.workers === null || typeof entity.lectureHours === "undefined" || entity.lectureHours === null || typeof entity.labHours === "undefined" || entity.labHours === null || typeof entity.credits === "undefined" || entity.credits === null || typeof entity.ects === "undefined" || entity.ects === null || typeof entity.prerequisites === "undefined" || entity.prerequisites === null) throw new Error(config.errors.MISSING_PARAMETER);

		const wantedEntity = await this.getCourse({
			_id: id
		});

		// validate name
		entity.name += "";
		if (entity.name.length < config.limits.course.minNameLength || entity.name.length > config.limits.course.maxNameLength) throw new Error(config.errors.COURSE.VALIDATION.INVALID_NAME);

		// validate description
		entity.description += "";
		if (entity.description.length < config.limits.course.minDescriptionLength || entity.description.length > config.limits.course.maxDescriptionLength) throw new Error(config.errors.COURSE.VALIDATION.INVALID_DESCRIPTION);

		// validate course code
		entity.courseCode += "";
		if (entity.courseCode.length < config.limits.course.minCourseCodeLength || entity.courseCode.length > config.limits.course.maxCourseCodeLength) throw new Error(config.errors.COURSE.VALIDATION.INVALID_COURSE_CODE);
		let duplicated = null;
		try {
			duplicated = await this.getCourse({
				courseCode: entity.courseCode
			});
		} catch {}

		if (!(typeof duplicated === "undefined" || duplicated === null) && duplicated._id + "" !== wantedEntity._id + "") throw new Error(config.errors.COURSE.DUPLICATION);

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

		entity.topics = entity.topics + "";
		entity.topics = entity.topics.split(",");
		entity.topics = entity.topics.map(topic => topic.trim());

		wantedEntity.name = entity.name;
		wantedEntity.description = entity.description;
		wantedEntity.courseCode = entity.courseCode;
		wantedEntity.departmentCode = entity.departmentCode;
		wantedEntity.type = entity.type;
		wantedEntity.topics = entity.topics;
		wantedEntity.workers = entity.workers;
		wantedEntity.lectureHours = entity.lectureHours;
		wantedEntity.labHours = entity.labHours;
		wantedEntity.credits = entity.credits;
		wantedEntity.ects = entity.ects;
		wantedEntity.pagePath = await helpers.generatePagePath(wantedEntity.courseCode);
		wantedEntity.prerequisites = entity.prerequisites;

		let courseUpdator;

		if (entity.courseUpdator === 0) courseUpdator = {
			type: 2
		}
		else courseUpdator = await AccountController.getAccountById(entity.courseUpdator);

		let newEntity;
		if (+courseUpdator.type === 2) {
			newEntity = await DatabaseController.update("course", wantedEntity);
			await helpers.updateCourse(newEntity);
		} else {
			entity.updatedCourseId = wantedEntity._id;
			const requestEntity = {
				body: entity,
				type: 1,
				createdBy: courseUpdator._id
			};
			newEntity = await RequestController.add(requestEntity);
		}
		return newEntity;
	},

	async delete(id, deletorId) {
		let courseDeletor;
		if (deletorId === 0) courseDeletor = {
			type: 2
		}
		else courseDeletor = await AccountController.getAccountById(deletorId);
		if (courseDeletor.type === 2) {
			const deletedCourse = await this.getCourse({_id: id});
			await helpers.deleteCourse(`${deletedCourse.departmentCode} ${deletedCourse.courseCode}`);
			const deleteResult = await DatabaseController.delete("course", {
				_id: id
			});
			return deleteResult;
		} else {
			const requestEntity = {
				body: id,
				type: 2,
				createdBy: deletorId
			};
			const newEntity = await RequestController.add(requestEntity);
			return newEntity;
		}
	},

	async publishCourse(id) {
		const wantedEntity = await this.getCourse({
			_id: id
		});
		wantedEntity.isOffered = true;
		await DatabaseController.update("course", wantedEntity);

		helpers.publishCourse(wantedEntity);

		return wantedEntity;
	}


}))();

export default CourseController;
