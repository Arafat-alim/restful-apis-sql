const {
  registerSchema,
  userByIdSchema,
  loginSchema,
  sendVerificationCodeSchema,
} = require("../middlewares/validator");
const { doHash, doHashValidation, hmacProcess } = require("../utils/hashing");
const User = require("../models/User");
const transport = require("../middlewares/sendMail");
const generateEmailTemplate = require("../utils/generateEmailTemplate");
const generateSecretKey = require("../utils/generateSecretKey ");
const { generateToken } = require("../utils/generateToken");
const generateVerificationEmail = require("../utils/generateVerificationEmail");

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
    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No Users found" });
    }
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

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const { error, value } = loginSchema.validate({ email, password });

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  try {
    //! find email in the db
    const existingUser = await User.getUserByEmail(email);
    const comparedPassword = await doHashValidation(
      password,
      existingUser.password
    );
    if (!existingUser || !comparedPassword) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid Credentials" });
    }

    //! generate jwt token
    const token = await generateToken({
      verified: existingUser.verified,
      email: existingUser.email,
      userId: existingUser.id,
    });

    //! Implementing the cookie
    res
      .cookie("Authorization", "Bearer " + token, {
        expires: new Date(Date.now() + 8 * 360000),
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      })
      .json({ success: true, token, message: "LoggedIn Successfully" });
  } catch (err) {
    console.log("Something went wrong with login controller: ", err);
    res.status(400).json({
      success: false,
      message: "Something went wrong. Please report to developer to check",
    });
  }
};

exports.logout = async (req, res) => {
  res
    .clearCookie("Authorization")
    .status(200)
    .json({ success: true, message: "Logout successfully" });
};

exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  const { error, value } = await sendVerificationCodeSchema.validate({ email });
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  try {
    const existingUser = await User.getUserByEmail(email);
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exists" });
    }

    //! otp
    const token = Math.floor(Math.random() * 1000000).toString();

    const info = await transport.sendMail({
      from: process.env.NODE_SENDING_EMAIL_ADDRESS,
      to: existingUser.email,
      subject: "",
      html: generateVerificationEmail(token, existingUser.name),
    });

    if (info.accepted[0] === existingUser.email) {
      //! create hmac process
      const hashedCodeValue = await hmacProcess(token, process.env.JWT_SECRET);
      const updateDB = await User.updateSendVerificationCode(
        existingUser.email,
        hashedCodeValue
      );
      console.log("updateDB", updateDB);

      if (updateDB) {
        return res
          .status(201)
          .json({ success: true, message: "Code has been sent" });
      }
    }
  } catch (err) {
    console.log("Something went wrong with Send verification code: ", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong, please report to developers",
    });
  }
};
