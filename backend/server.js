const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");

const dotenv = require("dotenv");

// Initialize .env file
//
dotenv.config();

const middleware = {
  testFunction: function (req, res, next) {
    let condition =
      typeof req.headers.origin === "string"
        ? req.headers.origin.includes(process.env.FRONTEND_URL)
        : false;

    if (req.headers["postman-token"]) {
      condition = true;
    }

    const token = req.cookies["auth_token"] || "";

    const originURL = req.originalUrl;
    const condition2 = originURL == "/summarize" ? Boolean(token) : true;

    if (condition && condition2) {
      next();
    } else {
      res.send({
        status: 403,
        data: "You do not have the correct permissions to use this route.",
      });
    }
  },
};

const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Initialize the server application
//
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Use a middle ware for security
//
app.use(middleware.testFunction);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    key: process.env.SESSION_KEY,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.set("json spaces", 3);
process.on("warning", (e) => console.warn(e.stack));

// const summarization = require("");
// app.use("/summarize", summarization);

// Start the server on the specified port
//
app.listen(process.env.PORT, () => {
  console.log("Using port: " + process.env.PORT);
});
