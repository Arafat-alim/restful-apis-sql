const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
// const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

//! middlewares

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//! routers

//! handle if routers not found

app.use((req, res) => {
  return res.status(404).json({ message: "Route not found" });
});

module.exports = app;
