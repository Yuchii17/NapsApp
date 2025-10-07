const nodemailer = require('nodemailer');

const mailer = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"OTP Verification" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = mailer;
