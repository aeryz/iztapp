import mongoose from "mongoose";

const Schema = mongoose.Schema;

const EmailSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model('email', EmailSchema);
