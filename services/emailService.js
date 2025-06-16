const transporter = require('../config/mailer');


  // @param {Object} options
  // @param {string} options.to 
  // @param {string} options.subject 
  // @param {string} options.html 
 
const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: `"Admin Team" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(' Failed to send email:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
};
