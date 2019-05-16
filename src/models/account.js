import mongoose from "mongoose";

const Schema = mongoose.Schema;

const AccountSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  isLocked: {
    type: Boolean,
    required: true,
    default: false
  },
  unlockHash: {
    type: String,
    required: true
  },
  lastLoginDate: {
    type: Date,
    required: true
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now()
  }
});

module.exports = mongoose.model('account', AccountSchema);
