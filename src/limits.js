// region Import libraries

import chalk from "chalk";

// endregion

// region Define env parser helpers

function parseIntFromEnvOr(name, defaultValue) {

  if (typeof process.env[name] === "undefined" || process.env[name] === null) return defaultValue;

  const parsedOption = +process.env[name];

  if (Number.isNaN(parsedOption) || parsedOption < 0 || Math.floor(parsedOption) !== parsedOption) {

    console.log(`${chalk.red.bold("(!)")} Invalid environment configuration detected: Expected a positive integer for option "${name}", instead got "${process.env[name]}"`);

    process.exit(1);

  }

  return parsedOption;

}

// endregion

// region Define limits

const limits = {

  user: {

    minNameLength: parseIntFromEnvOr("LIMITS_ADMIN_MIN_NAME_LENGTH", 1),

    maxNameLength: parseIntFromEnvOr("LIMITS_ADMIN_MAX_NAME_LENGTH", 30),

    minSurnameLength: parseIntFromEnvOr("LIMITS_ADMIN_MIN_SURNAME_LENGTH", 1),

    maxSurnameLength: parseIntFromEnvOr("LIMITS_ADMIN_MAX_SURNAME_LENGTH", 30),

    minEMailLength: parseIntFromEnvOr("LIMITS_ADMIN_MIN_EMAIL_LENGTH", 1),

    maxEMailLength: parseIntFromEnvOr("LIMITS_ADMIN_MAX_EMAIL_LENGTH", 254),

    minPasswordLength: parseIntFromEnvOr("LIMITS_ADMIN_MIN_PASSWORD_LENGTH", 5),

    maxPasswordLength: parseIntFromEnvOr("LIMITS_ADMIN_MAX_PASSWORD_LENGTH", 64),

    maxPasswordTry: parseIntFromEnvOr("LIMITS_ADMIN_MAX_PASSWORD_TRY", 8)

  },

};

// endregion

// region Export limits

export default limits;

// endregion
