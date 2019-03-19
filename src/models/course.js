const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  prerequisites: {
    type: [Object.Id],
    required: false
  },
  pagePath: {
    type: String,
    required: true
  },
  courseCode: {
    type: String,
    required: false
  },
  departmentCode: {
    type: String,
    required: true
  },
  topics: {
    type: [String],
    required: true
  },
  instructors: {
    type: [Object.Id],
    required: false
  },
  assistants: {
    type: [Object.Id],
    required: false
  },
  lectureHours: {
    type: Number,
    required: true
  },
  labHours: {
    type: Number,
    required: true
  },
  credits: {
    type: Number,
    required: true
  },
  ects: {
    type: Number,
    required: true
  },
  isOffered: {
    type: Boolean,
    default: false,
    required: true
  },
  isPending: {
    type: Boolean,
    default: true,
    required: true
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now()
  }
})

const CourseModel = mongoose.model('courseModel', CourseSchema);
module.exports = CourseModel;
