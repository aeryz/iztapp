import mongoose from "mongoose";

const Schema = mongoose.Schema;

const AccountSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	type: {
		type: Number,
		required: true
	},
	salt: {
		type: Number,
		required: true,
		default: 10
	},
	badLoginCount: {
		type: Number,
		required: true
	},
	isLocked: {
		type: Boolean,
		required: true,
		default: false
	},
	unlockHash: {
		type: String,
		required: true
	},
	lastLoginDate: {
		type: Date,
		required: true
	},
	creationDate: {
		type: Date,
		required: true,
		default: Date.now()
	}
});

export default mongoose.model("admin", AccountSchema);
