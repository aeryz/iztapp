// Import libraries
import chalk from "chalk";

// Define env parser helpers
function parseIntFromEnvOr(name, defaultValue) {
	if (typeof process.env[name] === "undefined" || process.env[name] === null) return defaultValue;
	const parsedOption = +process.env[name];
	if (Number.isNaN(parsedOption) || parsedOption < 0 || Math.floor(parsedOption) !== parsedOption) {
		console.log(`${chalk.red.bold("(!)")} Invalid environment configuration detected: Expected a positive integer for option "${name}", instead got "${process.env[name]}"`);
		process.exit(1);
	}
	return parsedOption;
}

// Define limits
const limits = {
	account: {
		minEmailLength: parseIntFromEnvOr("LIMITS_ACCOUNT_MIN_EMAIL_LENGTH", 1),
		maxEmailLength: parseIntFromEnvOr("LIMITS_ACCOUNT_MAX_EMAIL_LENGTH", 254),
		minPasswordLength: parseIntFromEnvOr("LIMITS_ACCOUNT_MIN_PASSWORD_LENGTH", 5),
		maxPasswordLength: parseIntFromEnvOr("LIMITS_ACCOUNT_MAX_PASSWORD_LENGTH", 64),
		maxPasswordTry: parseIntFromEnvOr("LIMITS_ACCOUNT_MAX_PASSWORD_TRY", 10)
	},
	email: {
		minEmailLength: parseIntFromEnvOr("LIMITS_EMAIL_MIN_EMAIL_LENGTH", 1),
		maxEmailLength: parseIntFromEnvOr("LIMITS_EMAIL_MAX_EMAIL_LENGTH", 254),
	}
};

// Export limits
export default limits;
