const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
require('dotenv').config();

const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,           
    domain: process.env.MAILGUN_DOMAIN,             
  }
};

const transporter = nodemailer.createTransport(mg(auth));

transporter.verify((error, success) => {
  if (error) {
    console.error('Mailer config error:', error);
  } else {
    console.log('Mailer is ready to send emails');
  }
});

module.exports = transporter;
