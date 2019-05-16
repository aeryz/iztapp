import mongoose from "mongoose";

const Schema = mongoose.Schema;

const EmailSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true
	}
});

export default mongoose.model("email", EmailSchema);
