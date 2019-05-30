import mongoose from "mongoose";

const Schema = mongoose.Schema;

const db = mongoose.createConnection("mongodb://localhost:27017/iztapp")

const WeeklyScheduleSchema = new Schema({
	days: {
		type: [{
			type: Schema.Types.ObjectId,
			required: true,
			ref: "dailySchedule"
		}],
		required: true
	},
	semester: {
		type: Number,
		required: true,
		min: 1,
	},
	type: {
		type: Number,
		required: true
	},
	creationDate: {
		type: Date,
		required: true,
		default: Date.now()
	}
})

export default db.model("weeklySchedule", WeeklyScheduleSchema);
