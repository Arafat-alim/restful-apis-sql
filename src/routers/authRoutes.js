const express = require("express");
const {
  register,
  getUsers,
  getUserByID,
  login,
  logout,
  sendVerificationCode,
  verifyEmailVerificationCode,
  forgotPasswordCode,
} = require("../controllers/authController");
const { identifier } = require("../middlewares/identification");

const router = express.Router();

router.post("/register", register);
router.get("/users", getUsers);
router.get("/user", getUserByID);
router.post("/login", login);
router.post("/logout", logout);

router.patch("/send-verification-code", sendVerificationCode);
router.patch("/verify-verification-code", verifyEmailVerificationCode);
router.patch("/send-forgot-password-code", identifier, forgotPasswordCode);

module.exports = router;
