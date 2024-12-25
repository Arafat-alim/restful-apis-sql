const { registerSchema, userByIdSchema } = require("../middlewares/validator");
const { doHash } = require("../utils/hashing");
const User = require("../models/User");
const transport = require("../middlewares/sendMail");
const generateEmailTemplate = require("../utils/generateEmailTemplate");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const { error, value } = registerSchema.validate({ email, password, name });

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    const existingUser = await User.getUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    //! password hashed
    const hashedPassword = await doHash(password, 12);
    //! creating new object for storing data into the db
    const userObject = {
      email,
      name,
      password: hashedPassword,
    };
    const user = await User.create(userObject);

    if (user.length !== 0) {
      //! inform user
      transport
        .sendMail({
          to: user[0].email,
          from: process.env.NODE_SENDING_EMAIL_ADDRESS,
          subject: `Welcome ${user[0].name}`,
          html: generateEmailTemplate({
            subject: "Welcome!", //data that will be render on the email template in the ejs file
            headerText: "Welcome!",
            bodyText:
              "Thank you for registering! Please verify your email to access more features.",
            actionText: "Please visit Dashboard", // Clear call to action
            actionUrl: "https://dev-arafat.netlify.app/", // Replace with your verification URL with token
            verificationCode: null, // consider sending a verification token or link
          }),
        })
        .then(() => console.log("Email sent successfully"))
        .catch((err) => console.error("Error sending email:", err)); //Error handling
    }

    res
      .status(201)
      .json({ success: true, message: "User Created", result: user[0] });
  } catch (err) {
    console.log("Something went wrong with the auth controller", err);
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    return res
      .status(200)
      .json({ success: true, message: "Users Fetched.", result: users });
  } catch (err) {
    console.log("Something went wrong with get all users api: ", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please ask developer to check",
    });
  }
};

exports.getUserByID = async (req, res) => {
  const { id } = req.query;

  const { error, value } = userByIdSchema.validate({ id });

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    const existingUser = await User.getUserById(id);
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }
    res
      .status(200)
      .json({ success: true, message: "User found", result: existingUser });
  } catch (err) {
    console.log("Something went wrong with get all users api: ", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please ask developer to check",
    });
  }
};
