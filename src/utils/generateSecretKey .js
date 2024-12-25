const crypto = require("crypto");

const generateSecretKey = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

module.exports = generateSecretKey;
