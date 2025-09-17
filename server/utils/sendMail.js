// utils/sendMail.js
const nodemailer = require("nodemailer");

const sendMail = async (to, subject, html) => {
  try {
    // Log recipient for debugging
    console.log("📧 Sending email to:", to);

    // Configure transporter once
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true, // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Actually send
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
    });

    console.log("✅ Mail sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Mail error:", err);
    throw err; // let caller know it failed
  }
};

module.exports = { sendMail };
