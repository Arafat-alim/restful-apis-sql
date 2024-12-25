const express = require("express");
const {
  register,
  getUsers,
  getUserByID,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.get("/users", getUsers);
router.get("/user", getUserByID);

module.exports = router;
