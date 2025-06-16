const nodemailer = require('nodemailer');
require('dotenv').config(); 

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'Not set');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",         
  port: 465,
  secure: true,                   
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error(' Mailer config error:', error);
  } else {
    console.log(' Mailer is ready to send emails');
  }
});

module.exports = transporter;
