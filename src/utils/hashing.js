const { hash, compare } = require("bcryptjs");

exports.doHash = async (value, saltvalue) => {
  return hash(value, saltvalue);
};
