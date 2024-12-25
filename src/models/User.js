const db = require("../config/db");
const { sendVerificationCode } = require("../controllers/authController");

class User {
  static async create(user) {
    return db("users").insert(user).returning("*");
  }

  static async getUserByEmail(email) {
    return db("users").where({ email, deletedUser: false }).first();
  }

  static async getAllUsers() {
    return db("users").where({ deletedUser: false });
  }

  static async getUserById(id) {
    return db("users").where({ id, deletedUser: false }).first();
  }

  static async updateSendVerificationCode(email, hashedCodeValue) {
    return db("users").where({ email }).update({
      verificationCode: hashedCodeValue,
      verificationCodeValidation: Date.now(),
    });
  }

  static async updateVerification(email, value) {
    return db("users").where({ email }).update({
      verified: value,
      verificationCode: null,
      verificationCodeValidation: null,
    });
  }

  static async updateForgotPasswordCode(email, hashedCodeValue) {
    return db("users").where({ email }).update({
      forgotPasswordCode: hashedCodeValue,
      forgotPasswordCodeValidation: Date.now(),
    });
  }

  static async updateSuccessForgotPasswordEvent(email, newPassword) {
    return db("users").where({ email }).update({
      password: newPassword,
      forgotPasswordCode: null,
      forgotPasswordCodeValidation: null,
    });
  }

  static async deleteUserByEmail(email) {
    return db("users").where({ email }).update({
      deletedUser: true,
    });
  }
}

module.exports = User;
