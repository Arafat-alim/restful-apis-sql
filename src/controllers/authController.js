const {
  registerSchema,
  userByIdSchema,
  loginSchema,
  validateEmailSchema,
  acceptCodeSchema,
  changePasswordSchema,
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
      error: err,
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
  const { error, value } = await validateEmailSchema.validate({ email });
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
      subject: "Email Verification Code",
      html: generateVerificationEmail(token, existingUser.name),
    });

    if (info.accepted[0] === existingUser.email) {
      //! create hmac process
      const hashedCodeValue = await hmacProcess(token, process.env.JWT_SECRET);
      const updateDB = await User.updateSendVerificationCode(
        existingUser.email,
        hashedCodeValue
      );

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

exports.verifyEmailVerificationCode = async (req, res) => {
  const { email, providedCode } = req.body;

  const { error, value } = await acceptCodeSchema.validate({
    email,
    providedCode,
  });

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    const codeValue = providedCode.toString();
    const existingUser = await User.getUserByEmail(email);
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not found" });
    }

    //! check user is verified
    if (existingUser.verified) {
      return res
        .status(400)
        .json({ success: false, message: "User already verified" });
    }

    if (
      !existingUser.verificationCodeValidation ||
      !existingUser.verificationCode
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Something went wrong with the verification code or verification code validation",
      });
    }

    //! Time expiration check
    if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
      return res
        .status(401)
        .json({ success: false, message: "Code has been expired" });
    }

    const hashedCodeValue = await hmacProcess(
      codeValue,
      process.env.JWT_SECRET
    );

    if (hashedCodeValue === existingUser.verificationCode) {
      const updateDB = await User.updateVerification(existingUser.email, true);
      if (updateDB) {
        return res.status(201).json({
          success: true,
          message: "Your email has been verified successfully!",
        });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Updation failed" });
      }
    }

    res.status(401).json({ success: false, message: "Verification Failed" });
  } catch (err) {
    console.log(
      "Something went wrong with Verify email verification code: ",
      err
    );
    res.status(500).json({
      success: false,
      message: "Something went wrong, please report to developer",
    });
  }
};

exports.forgotPasswordCode = async (req, res) => {
  const { email } = req.body;
  const { error, value } = await validateEmailSchema.validate({ email });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  try {
    //! find user using email
    const existingUser = await User.getUserByEmail(email);
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exists" });
    }

    // if (!existingUser.verified) {
    //   return res
    //     .status(403)
    //     .json({ success: false, message: "User is not verified" });
    // }

    const codeValue = Math.floor(Math.random() * 1000000).toString();

    const info = await transport.sendMail({
      from: process.env.NODE_SENDING_EMAIL_ADDRESS,
      to: existingUser.email,
      subject: "Reset Your Password",
      html: generateEmailTemplate({
        subject: "Reset Your Password",
        headerText: "Password Reset Request",
        bodyText:
          "It seems like you requested a password reset. Please use the verification code below to complete the process.",
        actionText: null,
        actionUrl: null,
        verificationCode: `${codeValue}`,
      }),
    });

    if (info.accepted[0] === existingUser.email) {
      const hashedCodeValue = await hmacProcess(
        codeValue,
        process.env.JWT_SECRET
      );

      const updateDB = await User.updateForgotPasswordCode(
        existingUser.email,
        hashedCodeValue
      );

      if (updateDB) {
        return res
          .status(201)
          .json({ success: true, message: "Forgot Password Code Sent" });
      } else {
        return res.status(403).json({
          success: false,
          message: "Sending Forgot Password Code was failed",
        });
      }
    }
  } catch (err) {
    console.log("Something went wrong with the forgot passsword code: ", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please report to devs",
    });
  }
};

exports.verifyForgotPasswordCode = async (req, res) => {
  const { email, providedCode, newPassword } = req.body;
  const { error, value } = await changePasswordSchema.validate({
    email,
    providedCode,
    newPassword,
  });

  if (error) {
    return res
      .status(403)
      .json({ success: false, message: error.details[0].message });
  }
  try {
    const existingUser = await User.getUserByEmail(email);
    const codeValue = providedCode.toString();
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not found" });
    }

    if (
      Date.now() - existingUser.forgotPasswordCodeValidation >
      5 * 60 * 1000
    ) {
      return res.status(403).json({ success: false, message: "Code expired" });
    }

    if (
      !existingUser.forgotPasswordCode ||
      !existingUser.forgotPasswordCodeValidation
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Something went wrong with the forgot password code or forgot password code validation",
      });
    }

    const hashedCodeValue = await hmacProcess(
      codeValue,
      process.env.JWT_SECRET
    );

    const hashedNewPassword = await doHash(newPassword, 12);

    if (hashedCodeValue === existingUser.forgotPasswordCode) {
      const updateDb = await User.updateSuccessForgotPasswordEvent(
        email,
        hashedNewPassword
      );
      if (updateDb) {
        return res.status(201).json({
          success: true,
          message: "Congratulations! Your new password has been updated!",
        });
      } else {
        return res.status(403).json({
          success: false,
          message: "Failed to update your new Password. Please try again",
        });
      }
    } else {
      return res.status(400).json({ success: false, message: "Invalid Code" });
    }
  } catch (err) {
    console.log(
      "Something went wrong with verify forgot passsword code: ",
      err
    );
    res.status(500).json({ success: false, message: "Unexpected occur" });
  }
};

exports.deleteUser = async (req, res) => {
  const { email } = req.body;
  const { error, value } = await validateEmailSchema.validate({ email });

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
        .json({ success: false, message: "User does not exist" });
    } else {
      const updatedDb = await User.deleteUserByEmail(existingUser.email);

      if (updatedDb) {
        return res
          .status(201)
          .json({ success: true, message: "User deleted successfully" });
      } else {
        return res.status(400).json({
          success: false,
          message: "Deletion operation has been failed, please try again",
        });
      }
    }
  } catch (err) {
    console.log("Something went wrong with Delete User controller: ", err);
  }
};
