const Jwt = require("jsonwebtoken");

exports.generateToken = async ({ verified, email, userId }) => {
  return Jwt.sign({ email, verified, userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
