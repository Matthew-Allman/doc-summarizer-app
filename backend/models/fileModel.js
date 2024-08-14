const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  summarizedText: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  size: { type: Number, required: true },
});

module.exports = mongoose.model("File", fileSchema);
