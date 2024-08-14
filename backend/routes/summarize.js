const router = require("express").Router();
const File = require("../models/fileModel");
const { extractTextFromUploadedFile } = require("../functions/extractText");
const multer = require("multer");
const AWS = require("aws-sdk");
const pyBackendAPI = require("../api/pyInstance");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

router.route("/").post(upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const userID = req.body.userID;

    if (userID) {
      const allowedExtensions = /(\.pdf|\.docx|\.txt)$/i;

      if (allowedExtensions.test(file.originalname)) {
        const response = await extractTextFromUploadedFile(file);

        if (response) {
          const result = await pyBackendAPI.post("/", { text: response });
          const summary = result?.data?.summary || "";

          if (summary) {
            const s3Params = {
              Bucket: process.env.AWS_S3_BUCKET_NAME,
              Key: `${userID}/${Date.now()}_${file.originalname}`,
              Body: file.buffer,
              ContentType: file.mimetype,
            };

            const s3Response = await s3.upload(s3Params).promise();

            if (s3Response && s3Response.Location) {
              const newFile = new File({
                userID: userID,
                fileName: s3Params.Key,
                originalName: file.originalname,
                fileUrl: s3Response.Location,
                summarizedText: summary,
                size: file.size,
              });

              await newFile.save();

              const obj = {
                successMessage: "File saved successfully.",
                s3BucketKey: s3Params.Key,
                summary,
              };

              res.send(obj);
            } else {
              const obj = { errMessage: "Could not save file to S3 bucket." };

              res.status(500).json(obj);
            }
          } else {
            res.status(500).json({ error: "Failed to generate summary." });
          }
        } else {
          res.status(500).json({ error: "Failed to extract text from file." });
        }
      } else {
        res.status(403).json({
          error: "File format must be PDF, DOCX, or TXT.",
        });
      }
    } else {
      res.status(403).json({
        error: "You do not have the correct permissions to use this route.",
      });
    }
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
