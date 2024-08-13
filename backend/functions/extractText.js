const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const path = require("path");

const extractTextFromUploadedFile = async (file) => {
  try {
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (fileExtension === ".pdf") {
      return extractTextFromPdf(file.buffer);
    } else if (fileExtension === ".docx") {
      return extractTextFromDocx(file.buffer);
    } else if (fileExtension === ".txt") {
      return extractTextFromTxt(file.buffer);
    } else {
      return false;
    }
  } catch (e) {
    console.log(e);

    return false;
  }
};

const extractTextFromPdf = async (buffer) => {
  const data = await pdf(buffer);

  return data.text;
};

const extractTextFromDocx = async (buffer) => {
  const result = await mammoth.extractRawText({ buffer });

  return result.value;
};

const extractTextFromTxt = async (buffer) => {
  return buffer.toString("utf8");
};

module.exports = { extractTextFromUploadedFile };
