import mongoose from "mongoose";
const Schema = mongoose.Schema;

const WeeklyScheduleSchema = new Schema({
  year: {
    type: Number,
    required: true
  },
  days: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: "dailySchedule"
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now()
  },
  isPending: {
    type: Boolean,
    required: true,
    default: true
  }
})

const WeeklyScheduleModel = mongoose.model('weeklySchedule', WeeklyScheduleSchema);
module.exports = WeeklyScheduleModel;
