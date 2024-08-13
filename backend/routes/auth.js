const User = require("../models/userModel");
const crypto = require("crypto");
const router = require("express").Router();

router.route("/").post(async (req, res) => {
  const token = req.cookies["auth_token"];

  try {
    let userDoc = await User.findOne({ token });

    if (!userDoc) {
      const newToken = crypto.randomBytes(16).toString("hex");
      const userID = crypto.randomBytes(8).toString("hex");

      userDoc = await User.create({ token: newToken, userID });

      res.cookie("auth_token", newToken, { httpOnly: true });

      res.json({ data: "User Specific Data", userID: userDoc.userID });
    } else {
      res.json({ data: "User Specific Data", userID: userDoc.userID });
    }
  } catch (error) {
    console.error("Error handling request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
