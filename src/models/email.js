import mongoose from "mongoose";

const Schema = mongoose.Schema;

const db = mongoose.createConnection("mongodb://localhost:27017/iztapp")

const EmailSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true
	}
});

export default db.model("email", EmailSchema);
