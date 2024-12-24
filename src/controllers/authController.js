const { registerSchema } = require("../middlewares/validator");
const { doHash } = require("../utils/hashing");
const User = require("../models/User");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const { error, value } = registerSchema.validate({ email, password, name });

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    //! password hashed
    const hashedPassword = await doHash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    res
      .status(201)
      .json({ success: true, message: "User Created", result: user[0] });
  } catch (err) {
    console.log("Something went wrong with the auth controller", err);
  }
};
