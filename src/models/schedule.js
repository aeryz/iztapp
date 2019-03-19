import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ScheduleSchema = new Schema({
  day: {
    type: Number,
    required: true
  },
  year: {
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

const ScheduleModel = mongoose.model('schedule', ScheduleSchema);
module.exports = ScheduleModel;
