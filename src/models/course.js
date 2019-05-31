import mongoose from "mongoose";

const Schema = mongoose.Schema;

const db = mongoose.createConnection("mongodb://localhost:27017/iztapp")

const CourseSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	prerequisites: {
		type: [{
			type: Schema.Types.ObjectId,
			ref: "course",
			required: false
		}],
		required: false,
		default: []
	},
	pagePath: {
		type: String,
		required: true,
		unique: true
	},
	courseCode: {
		type: String,
		required: true,
		unique: true
	},
	departmentCode: {
		type: String,
		required: true
	},
	topics: {
		type: [String],
		required: true
	},
	type: {
		type: Number,
		required: true
	},
	workers: {
		type: [{
			type: Schema.Types.ObjectId,
			ref: "worker",
			required: true
		}],
		required: true
	},
	lectureHours: {
		type: Number,
		required: true
	},
	labHours: {
		type: Number,
		required: true
	},
	credits: {
		type: Number,
		required: true
	},
	ects: {
		type: Number,
		required: true
	},
	isOffered: {
		type: Boolean,
		default: false,
		required: true
	},
	creationDate: {
		type: Date,
		required: true,
		default: Date.now()
	}
});

export default db.model("course", CourseSchema);
