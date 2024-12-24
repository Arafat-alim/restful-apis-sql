const db = require("../config/db");

class User {
  static async create(user) {
    return db("users").insert(user).returning("*");
  }

  static async getUserByEmail(email) {
    return db("users").where({ email }).first();
  }
}

module.exports = User;
