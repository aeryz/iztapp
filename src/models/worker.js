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
  isAssistant: {
    type: Boolean,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  photoPath: {
    type: String,
    required: false
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now()
  }
})

module.exports = mongoose.model('worker', WorkerSchema);
