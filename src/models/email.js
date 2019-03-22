import mongoose from "mongoose";
const Schema = mongoose.Schema;

const EmailSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  }
})

// Auto increment _id's as number
EmailSchema.plugin(autoIncrement.plugin, 'email')
const EmailModel = mongoose.model('email', EmailModel);
module.exports = EmailModel;
