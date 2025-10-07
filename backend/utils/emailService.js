const mailer = require('./mailer');

const emailTemplate = (title, messageLines) => {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);">
        <h2 style="color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px;">${title}</h2>
        <div style="margin-top: 20px; color: #555; line-height: 1.6;">
          ${messageLines.map(line => `<p>${line}</p>`).join('')}
        </div>
        <div style="margin-top: 30px; font-size: 13px; color: #888;">
          <p>Thank you,<br>Dinehub Team</p>
        </div>
      </div>
    </div>
  `;
};

exports.sendRegistrationSuccessEmail = async (email, firstName) => {
  const subject = 'Welcome to Dinehub!';
  const message = [
    `Hello ${firstName},`,
    'Thank you for registering with <strong>DineHub</strong>.',
    `We are delighted to welcome you to our community.`,
    'Your registration was successful. You can now explore a variety of delicious meals, place orders with ease, and reserve your preferred table for a seamless dining experience.'
  ];
  
  const html = emailTemplate(subject, message);

  try {
    await mailer(email, subject, html);
    return true;
  } catch (err) {
    console.error('Failed to send registration email:', err);
    return false;
  }
};

exports.sendPasswordChangeConfirmation = async (email, firstName) => {
  const subject = 'Your Password Was Successfully Changed';
  const message = [
    `Hi ${firstName},`,
    'This is a confirmation that your password has been successfully updated for your <strong>Dinehub</strong> account.',
    'If you did not perform this action, please contact our support team immediately.'
  ];

  const html = emailTemplate(subject, message);

  try {
    await mailer(email, subject, html);
    return true;
  } catch (err) {
    console.error('Failed to send password change confirmation:', err);
    return false;
  }
};
