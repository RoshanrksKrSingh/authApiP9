require('dotenv').config(); // Load env variables
const { Vonage } = require('@vonage/server-sdk');

// Initialize Vonage
const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

const VONAGE_SENDER = process.env.VONAGE_SENDER || 'VonageAPIs';

// Exported function to send SMS
const sendSMS = async ({ to, text }) => {
  try {
    const response = await vonage.sms.send({
      to,
      from: VONAGE_SENDER,
      text,
    });
    console.log('SMS sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('SMS sending failed:', error);
    return { success: false, error };
  }
};

module.exports = { sendSMS };
