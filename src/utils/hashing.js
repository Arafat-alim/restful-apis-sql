const { hash, compare } = require("bcryptjs");

exports.doHash = async (value, saltvalue) => {
  return hash(value, saltvalue);
};

exports.doHashValidation = async (password, hashedPassword) => {
  return compare(password, hashedPassword);
};
