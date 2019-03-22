import mongoose from "mongoose";
const Schema = mongoose.Schema;

const DailyScheduleSchema = new Schema({
  day: {
    type: Number,
    required: true
  },
  courses: {
    type: [{
      type: Schema.Types.ObjectId,
      required: true,
      ref: "course"
    }],
    required: true
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now()
  }
})

const DailyScheduleModel = mongoose.model('dailySchedule', DailyScheduleModel);
module.exports = DailyScheduleModel;
