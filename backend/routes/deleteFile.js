const router = require("express").Router();
const File = require("../models/fileModel");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

router.route("/").post(async (req, res) => {
  const { userID, key } = req.body;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  };

  try {
    const result = await File.findOneAndDelete({ userID, fileName: key });
    const data = await s3.deleteObject(params).promise();

    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(500);
  }
});

module.exports = router;
