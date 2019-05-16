import mongoose from "mongoose"

const Schema = mongoose.Schema

const EmailListSchema = new Schema({
  emails: {
    type: {
      type: [Schema.Types.ObjectId],
      required: true,
      ref: "email"
    },
    required: true,
    default: []
  },
  name: {
    type: String,
    required: true
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now()
  }
});

module.exports = mongoose.model('emailList', EmailListSchema);;
