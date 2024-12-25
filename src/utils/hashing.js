const { hash, compare } = require("bcryptjs");
const { createHmac } = require("crypto");

exports.doHash = async (value, saltvalue) => {
  return hash(value, saltvalue);
};

exports.doHashValidation = async (password, hashedPassword) => {
  return compare(password, hashedPassword);
};

exports.hmacProcess = async (value, key) => {
  return createHmac("sha256", key).update(value).digest("hex");
};
