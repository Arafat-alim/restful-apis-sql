const nodeMailer = require("nodemailer");

const transport = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODE_SENDING_EMAIL_ADDRESS,
    pass: process.env.NODE_SENDING_EMAIL_PASSWORD,
  },
});

module.exports = transport;
