// Read environment from .env file
import dotenv from "dotenv";
dotenv.config();

// Import libraries
import crypto from "crypto";
import chalk from "chalk";
import mongoose from "mongoose";

// Import limits
import limits from "./limits";

// Import locales
import localeEN from "./locales/en";
import localeTR from "./locales/tr";

// Import models
import Account from "./models/account";

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
	locales: {
		en: localeEN,
		tr: localeTR
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
	},
	accountTypes: [
		0, // All accounts
		1, // Content managers
		2 // Admins
	],
	errors: {
		UNKNOWN: "1",
		INVALID_LIMIT: "2",
		INVALID_SKIP: "3",
		INVALID_ACCOUNT_TYPE: "4",
		INVALID_MODEL: "5",
		INVALID_QUERY: "6",
		UNFILLED_REQUIREMENTS: "7",
		RECORD_NOT_FOUND: "8",
		EMAIL_VALIDATION: "9",
		PASSWORD_VALIDATION: "10",
		LOCKED_ACCOUNT: "11",
		WRONG_PASSWORD: "12",
		UNDONE_UPDATE: "13",
		NOT_PERMITTED: "14",
		EMAIL_LIST_NAME_VALIDATION: "15",
		EMAIL_ALREADY_ADDED: "16"
	}
};

// region Export configurations
export default config;
