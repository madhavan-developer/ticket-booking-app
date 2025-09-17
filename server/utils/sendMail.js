// utils/sendMail.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // 465 for SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendMail = async (to, subject, html) => {
  return transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html,
  });
};

// ✅ new: send with inline image
const sendMailWithAttachment = async (to, subject, html, posterPath) => {
  return transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html,
    attachments: posterPath
      ? [
          {
            filename: "poster.jpg",
            path: posterPath, // works with URL or local path
            cid: "posterImg", // must match html src="cid:posterImg"
          },
        ]
      : [],
  });
};

module.exports = { sendMail, sendMailWithAttachment };
