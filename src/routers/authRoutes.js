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
  verifyForgotPasswordCode,
  deleteUser,
} = require("../controllers/authController");
const { identifier } = require("../middlewares/identification");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", identifier, getUsers);
router.post("/logout", identifier, logout);
router.get("/user", identifier, getUserByID);

router.patch("/send-verification-code", identifier, sendVerificationCode);
router.patch(
  "/verify-verification-code",
  identifier,
  verifyEmailVerificationCode
);
router.patch("/send-forgot-password-code", identifier, forgotPasswordCode);
router.patch(
  "/verify-forgot-password-code",
  identifier,
  verifyForgotPasswordCode
);

router.delete("/delete", identifier, deleteUser);
module.exports = router;
