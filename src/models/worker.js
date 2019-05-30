import mongoose from "mongoose";

const Schema = mongoose.Schema;

const db = mongoose.createConnection("mongodb://localhost:27017/iztapp")

const WorkerSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	surname: {
		type: String,
		required: true
	},
	isAssistant: {
		type: Boolean,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	photoPath: {
		type: String,
		required: false
	},
	creationDate: {
		type: Date,
		required: true,
		default: Date.now()
	}
})

export default db.model("worker", WorkerSchema);
