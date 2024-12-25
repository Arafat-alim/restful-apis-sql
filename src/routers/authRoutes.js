const express = require("express");
const {
  register,
  getUsers,
  getUserByID,
  login,
  logout,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.get("/users", getUsers);
router.get("/user", getUserByID);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
