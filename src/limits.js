// Import libraries
import chalk from "chalk";

// Define limits
const limits = {
	general: {
		minLimit: 1
	},
	account: {
		minEmailLength: 1,
		maxEmailLength: 254,
		minPasswordLength: 5,
		maxPasswordLength: 64,
		maxPasswordTry: 10
	},
	email: {
		minEmailLength: 1,
		maxEmailLength: 254
	},
	emailList: {
		minNameLength: 1,
		maxNameLength: 30
	},
	weeklySchedule: {
		minSemesterNumber: 1,
		maxSemesterNumber: 12,
		minDayNumber: 0,
		maxDayNumber: 4
	},
	dailySchedule: {
		minDayNumber: 0,
		maxDayNumber: 4
	},
	course: {
		minNameLength: 1,
		maxNameLength: 120,
		minDescriptionLength: 1,
		maxDescriptionLength: 1000,
		minCourseCodeLength: 1,
		maxCourseCodeLength: 12,
		minDepartmentCodeLength: 1,
		maxDepartmentCodeLength: 12,
		minLectureHours: 1,
		maxLectureHours: 10,
		minLabHours: 0,
		maxLabHours: 10,
		minCredits: 1,
		maxCredits: 20,
		minEcts: 1,
		maxEcts: 20,
	}
};

// Export limits
export default limits;
