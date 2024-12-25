const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
// const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
require("dotenv").config();

const authRoutes = require("./routers/authRoutes");
const cookieParser = require("cookie-parser");

const app = express();

//! middlewares

app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//! routers
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Server is Live" });
});

//! handle if routers not found

app.use((req, res) => {
  return res.status(404).json({ message: "Route not found" });
});

module.exports = app;
