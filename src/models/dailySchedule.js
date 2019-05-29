import mongoose from "mongoose";

const Schema = mongoose.Schema;

const DailyScheduleSchema = new Schema({
	courses: {
		type: {
			type: [Schema.Types.ObjectId],
			required: true,
			ref: "course"
		},
		required: true
	},
	creationDate: {
		type: Date,
		required: true,
		default: Date.now()
	}
});

export default mongoose.model("dailySchedule", DailyScheduleSchema);
