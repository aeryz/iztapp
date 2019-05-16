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
  isPending: {
    type: Boolean,
    required: true,
    default: true
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

module.exports = mongoose.model('weeklySchedule', WeeklyScheduleSchema);
