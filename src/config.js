// Read environment from .env file
import dotenv from "dotenv";
dotenv.config();

// Import libraries
import crypto from "crypto";
import chalk from "chalk";
import mongoose from "mongoose";

// Import limits
import limits from "./limits";

// Import models
import Account from "./models/account";
import Worker from "./models/worker";
import Course from "./models/course";
import DailySchedule from "./models/dailySchedule";
import WeeklySchedule from "./models/weeklySchedule";
import Email from "./models/email";
import EmailList from "./models/emailList";
import Request from "./models/request";


// Define env parser helper
function parseIntFromEnvOr(name, defaultValue) {
	if (typeof process.env[name] === "undefined" || process.env[name] === null) return defaultValue;
	const parsedOption = +process.env[name];
	if (Number.isNaN(parsedOption) || Math.floor(parsedOption) !== parsedOption) {
		console.log(`${chalk.red.bold("(!)")} Invalid environment configuration detected: Expected an integer for option "${name}", instead got "${process.env[name]}"`);
		process.exit(1);
	}
	return parsedOption;
}

// region Set configurations
const config = {
	mainDirectory: __dirname,
	port: parseIntFromEnvOr("CONFIG_PORT", 5000),
	isDev: process.env.NODE_ENV !== "production",
	owner: process.env.CONFIG_OWNER || "DEBAK",
	databaseConnections: {
		main: mongoose.createConnection(process.env.CONFIG_DATABASE || "mongodb://localhost:27017/iztapp")
	},
	supportedLangs: [
		"en",
		"tr"
	],
	limits,
	minSalt: parseIntFromEnvOr("CONFIG_SALT_ROUNDS", 4),
	maxSalt: parseIntFromEnvOr("CONFIG_SALT_ROUNDS", 12),
	hashAlgorithm: process.env.CONFIG_HASH_ALGORITHM || "sha512",
	encryptionAlgorithm: process.env.CONFIG_ENCRYPTION_ALGORITHM || "aes-256-cbc",
	jwtOptions: {
		secret: process.env.CONFIG_JWTOPTIONS_SECRET || "Default_Jwt_Secret",
		idEncryptionSecret: crypto.createHash("sha256").update(process.env.CONFIG_JWTOPTIONS_ID_ENCRYPTION_SECRET || "Default_ID_Encryption_Secret").digest(),
		idEncryptionIvSize: parseIntFromEnvOr("CONFIG_JWTOPTIONS_ID_ENCRYPTION_IV_SIZE", 16),
		expiresIn: parseIntFromEnvOr("CONFIG_JWTOPTIONS_EXPIRESIN", 2629746)
	},
	models: {
		"account": Account,
		"worker": Worker,
		"course": Course,
		"email": Email,
		"emailList": EmailList,
		"dailySchedule": DailySchedule,
		"weeklySchedule": WeeklySchedule,
		"request": Request
	},
	accountTypes: [
		0, // All accounts
		1, // Content managers
		2 // Admins
	],
	scheduleTypes: [
		0, // Lisans
		1, // Yüksek
		2 // Doktora
	],
	requestTypes: [
		0, // Add
		1, // Update
		2 // Delete
	],
	requestStatus: [
		0, // Pending
		1, // Accepted
		2 // Rejected
	],
	requestStates: [
		0, // Accepted
		1 // Rejected
	],
	errors: {
		UNKNOWN: "Unknown error occured!",
		MISSING_PARAMETER: "Required parameters are not given. Please try again.",
		RECORD_NOT_FOUND: "We couldn't find any records which match with given parameter(s). Please check the parameter(s) and try again.",
		DELETE_FAILURE: "Delete operation is not done because of some reason. Please try again.",
		UPDATE_FAILURE: "Update operation is not done because of some reason. Please try again.",
		ADD_FAILURE: "Add operation is not done because of some reason. Please try again.",
		PERMISSON_DENIED: "You don't have access to do that.",
		SESSION_EXPIRED: "Your session is expired. Please login again.",
		VALIDATION: {
			INVALID_VALIDATION_TYPE: "Given validation type is not valid. Please enter a valid validation type.",
			INVALID_LIMIT: "Given limit amount is not a positive integer. Please enter a positive integer for limit amount to proceed.",
			INVALID_SKIP: "Given skip amount is not a positive integer. Please enter a positive integer for skip amount to proceed.",
			INVALID_EMAIL: "Given email is not valid. Please enter a valid email.",
			INVALID_ID: "Given ID is wrong formatted. Please check the ID and try again.",
			INVALID_MODEL: "Given model is not valid. Please enter a valid model.",
			INVALID_QUERY: "Given query is not valid. Please enter a valid query."
		},
		ACCOUNT: {
			VALIDATION: {
				INVALID_TYPE: "Given account type is not valid. Please enter a valid account type.",
				INVALID_EMAIL: `Given email's length must be between ${limits.account.minEmailLength} and ${limits.account.maxEmailLength} characters.`,
				INVALID_PASSWORD: `Given password's length must be between ${limits.account.minPasswordLength} and ${limits.account.maxPasswordLength} characters.`,
			},
			LOCKED_ACCOUNT: "This account is locked. Please check your email to unlock your account.",
			WRONG_PASSWORD: "Given password is wrong. Please check your password and try again.",
			ALREADY_LOCKED: "This account is already locked.",
			ALREADY_UNLOCKED: "This account is already unlocked.",
		},
		EMAIL: {
			VALIDATION: {
				INVALID_EMAIL: `Given email's length must be between ${limits.email.minEmailLength} and ${limits.email.maxEmailLength} characters.`
			}
		},
		EMAIL_LIST: {
			ALREADY_ADDED: "This email list already includes given email.",
			NOT_IN_LIST: "Given email not in given email list.",
			VALIDATION: {
				INVALID_NAME: `Given email list name's length must be between ${limits.emailList.minNameLength} and ${limits.emailList.maxNameLength} characters.`,
			}
		},
		REQUEST: {
			VALIDATION: {
				INVALID_TYPE: "Given request type is not valid. Please enter a valid request type.",
				INVALID_STATE: "Given request state is not valid. Please enter a valid state."
			}
		},
		COURSE: {
			VALIDATION: {
				INVALID_NAME: `Given course name length must be between ${limits.course.minNameLength} and ${limits.course.maxNameLength} characters.`,
				INVALID_DESCRIPTION: `Given course description length must be between ${limits.course.minDescriptionLength} and ${limits.course.maxDescriptionLength} characters.`,
				INVALID_COURSE_CODE: `Given course code length must be between ${limits.course.minCourseCodeLength} and ${limits.course.maxCourseCodeLength} characters.`,
				INVALID_DEPARTMENT_CODE: `Given department code length must be between ${limits.course.minDepartmentCodeLength} and ${limits.course.maxDepartmentCodeLength} characters.`,
				INVALID_TYPE: "Given course type is not valid. Please enter a valid course type.",
				INVALID_LECTURE_HOURS: `Given lecture hours must be between ${limits.course.minLectureHours} and ${limits.course.maxLectureHours}.`,
				INVALID_LAB_HOURS: `Given lab hours must be between ${limits.course.minLabHours} and ${limits.course.maxLabHours}.`,
				INVALID_CREDITS: `Given creadits must be between ${limits.course.minCredits} and ${limits.course.maxCredits}.`,
				INVALID_ECTS: `Given ectes must be between ${limits.course.minEcts} and ${limits.course.maxEcts}.`,
			}
		},
		WEEKLY_SCHEDULE: {
			VALIDATION: {
				INVALID_TYPE: "Given weekly schedule type is not valid. Please enter a valid weekly schedule type.",
				INVALID_SEMESTER: `Given semester must be between ${limits.weeklySchedule.maxSemesterNumber} and ${limits.weeklySchedule.maxSemesterNumber}.`,
				INVALID_DAY: `Given day must be between ${limits.weeklySchedule.minDayNumber} and ${limits.weeklySchedule.maxDayNumber}.`
			},
			TYPE_MISMATCH: "Given weekly and daily schedule types must be the same.",
			EMPTY_DAY: "Given day is already empty in given weekly schedule."
		},
		DAILY_SCHEDULE: {
			VALIDATION: {
				INVALID_TYPE: "Given daily schedule type is not valid. Please enter a valid daily schedule type.",
				INVALID_DAY: `Given day must be between ${limits.dailySchedule.minDayNumber} and ${limits.dailySchedule.maxDayNumber}.`
			}
		},
	}
};

// region Export configurations
export default config;
