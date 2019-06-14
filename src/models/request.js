import mongoose from "mongoose";

const Schema = mongoose.Schema;

const db = mongoose.createConnection("mongodb://localhost:27017/iztapp")

const RequestSchema = new Schema({
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: "account",
		required: true
	},
	type: {
		type: Number,
		required: true
	},
	body: {
		type: Object,
		required: true
	},
	status: {
		type: Number,
		required: true
	},
	handledBy: {
		type: Schema.Types.ObjectId,
		ref: "account",
		required: false
	},
	creationDate: {
		type: Date,
		required: true,
		default: Date.now()
	},
	handledDate: {
		type: Date,
		required: false
	}
})

export default db.model("request", RequestSchema);
