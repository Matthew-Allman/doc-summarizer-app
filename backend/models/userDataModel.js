const mongoose = require("mongoose");

const userDataSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  text: { type: String, required: true },
  summarized_text: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserData", userDataSchema);
