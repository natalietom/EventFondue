const mongoose = require("mongoose");
const Review = require("./review");

//SCHEMA SETUP
const eventSchema = new mongoose.Schema({
	name: String, 
	price: String,
	image: String,
	description: String, 
	createdOn: { type: Date, default: Date.now},
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user"
		},
		username: String
	},
	reviews: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Review"
		}
	],
	rating: {
		type: Number,
		default: 0
	}
});

//when events.js file is required, it'll be the model
module.exports = mongoose.model("Event", eventSchema);