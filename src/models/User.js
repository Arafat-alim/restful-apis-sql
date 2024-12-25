const db = require("../config/db");

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
}

module.exports = User;
