const User = require("../models/userModel");
const crypto = require("crypto");
const router = require("express").Router();

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

      // Do stuff here to get files and summarized texts then return the data

      res.send({ loggedIn: true, userInfo: { userID: userDoc.userID } });
    }
  } catch (error) {
    console.error("Error handling request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
