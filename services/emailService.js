// const { Resend } = require('resend');
// require('dotenv').config();

// const resend = new Resend(process.env.RESEND_API_KEY);

// const sendEmail = async ({ to, subject, html }) => {
//   try {
//     const { data, error } = await resend.emails.send({
//       from: process.env.RESEND_FROM_EMAIL, 
//       to,
//       subject,
//       html,
//     });

//     if (error) {
//       console.error('Failed to send email:', error);
//       return { success: false, error: error.message };
//     }

//     console.log('Email sent:', data.id);
//     return { success: true, messageId: data.id };
//   } catch (err) {
//     console.error('Unexpected error:', err.message);
//     return { success: false, error: err.message };
//   }
// };

// module.exports = { sendEmail };
