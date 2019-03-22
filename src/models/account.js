import mongoose from "mongoose";
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
  name: {
    type: String,
    required: true
  },
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
  creationDate: {
    type: Date,
    required: true,
    default: Date.now()
  }
});

const AccountModel = mongoose.model('account', AccountSchema);
module.exports = AccountModel;
