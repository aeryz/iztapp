import mongoose from "mongoose";
const Schema = mongoose.Schema;

const WorkerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  },
  biography: {
    type: String,
    required: true
  },
  education: {
    type: String,
    required: false
  },
  type: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  website: {
    type: String,
    required: true
  },
  photoPath: {
    type: String,
    required: false
  },
  publications: {
    type: [String],
    required: true,
    default: []
  },
  projects: {
    type: [String],
    required: true,
    default: []
  },
  socialAccounts: {
    type: [{
      id: Number,
      link: String
    }],
    required: false
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now()
  }
})

const WorkerModel = mongoose.model('worker', WorkerSchema);
module.exports = WorkerModel;
