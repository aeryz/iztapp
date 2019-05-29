import mongoose from "mongoose";

const Schema = mongoose.Schema;

const WeeklyScheduleSchema = new Schema({
	days: {
		type: {
			type: [Schema.Types.ObjectId],
			required: true,
			ref: "dailySchedule"
		},
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

export default mongoose.model("weeklySchedule", WeeklyScheduleSchema);
