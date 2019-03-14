// region Read environment from .env file

import dotenv from "dotenv";

dotenv.config();

// endregion

// region Import libraries

import crypto from "crypto";

import chalk from "chalk";

import mongoose from "mongoose";

// endregion

// region Import limits

import limits from "./limits";

// endregion

// region Import locales

import localeEN from "./locales/en";

import localeTR from "./locales/tr";

// endregion

// region Define env parser helper

function parseIntFromEnvOr(name, defaultValue) {

  if (typeof process.env[name] === "undefined" || process.env[name] === null) return defaultValue;

  const parsedOption = +process.env[name];

  if (Number.isNaN(parsedOption) || Math.floor(parsedOption) !== parsedOption) {

    console.log(`${chalk.red.bold("(!)")} Invalid environment configuration detected: Expected an integer for option "${name}", instead got "${process.env[name]}"`);

    process.exit(1);

  }

  return parsedOption;

}

// endregion

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

  salt: parseIntFromEnvOr("CONFIG_SALT_ROUNDS", 10),

  hashAlgorithm: process.env.CONFIG_HASH_ALGORITHM || "sha512",

  encryptionAlgorithm: process.env.CONFIG_ENCRYPTION_ALGORITHM || "aes-256-cbc",

  jwtOptions: {

    secret: process.env.CONFIG_JWTOPTIONS_SECRET || "Default_Jwt_Secret",

    idEncryptionSecret: crypto.createHash("sha256").update(process.env.CONFIG_JWTOPTIONS_ID_ENCRYPTION_SECRET || "Default_ID_Encryption_Secret").digest(),

    idEncryptionIvSize: parseIntFromEnvOr("CONFIG_JWTOPTIONS_ID_ENCRYPTION_IV_SIZE", 16),

    expiresIn: parseIntFromEnvOr("CONFIG_JWTOPTIONS_EXPIRESIN", 2629746)

  },

  errors: {

    UNKNOWN: "1",

  }

};

// endregion

// region Export configurations

export default config;

// endregion
