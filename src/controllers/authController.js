const { registerSchema } = require("../middlewares/validator");
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

    //! password hashed
    const hashedPassword = await doHash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    if (user.length !== 0) {
      //! inform user
      transport
        .sendMail({
          to: user[0].email,
          from: process.env.NODE_SENDING_EMAIL_ADDRESS,
          subject: "",
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
