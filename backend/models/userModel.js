const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userID: { type: String, required: true },
  dateCreated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
