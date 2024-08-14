const router = require("express").Router();
const crypto = require("crypto");

const User = require("../models/userModel");
const File = require("../models/fileModel");

const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

router.route("/").get(async (req, res) => {
  const token = req?.cookies?.["auth_token"] || "";

  try {
    let userDoc = {};

    if (!token) {
      const newToken = crypto.randomBytes(16).toString("hex");
      const userID = crypto.randomBytes(8).toString("hex");

      userDoc = await User.create({ token: newToken, userID });

      res.cookie("auth_token", newToken, { httpOnly: true });

      res.send({ loggedIn: true, userInfo: { userID: userDoc.userID } });
    } else {
      userDoc = await User.findOne({ token });

      const userID = userDoc.userID;

      const userFiles = await File.find({ userID });
      const files = [];

      if (userFiles.length > 0) {
        for (const file of userFiles) {
          const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: file.fileName,
            Expires: 60 * 60,
          };

          const uri = s3.getSignedUrl("getObject", params);

          files.push({
            key: file?.fileName || "",
            lastModified: file?.uploadDate || "",
            size: file?.size || "",
            name: file.originalName || "",
            uri: uri || "",
            summarizedText: file.summarizedText,
          });
        }
      }

      // const files = userFiles.map((file) => {
      //   const s3File = data.Contents.find(
      //     (s3Item) => s3Item.Key === file.fileName
      //   );

      //   return {
      //     key: s3File?.Key || "",
      //     lastModified: s3File?.LastModified || "",
      //     size: s3File?.Size || "",
      //     name: file.originalName || "",
      //     uri: file.fileUrl || "",
      //     summarizedText: file.summarizedText,
      //   };
      // });

      // console.log(files);

      res.send({
        loggedIn: true,
        userInfo: { userID: userDoc.userID, files },
      });
    }
  } catch (error) {
    console.error("Error handling request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
