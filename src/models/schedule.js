const mongoose = require('mongoose');
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
    type: [Object.Id],
    required: true
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now()
  }
})

const ScheduleModel = mongoose.model('scheduleModel', ScheduleSchema);
module.exports = ScheduleModel;
