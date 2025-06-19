require('dotenv').config(); 
const { Vonage } = require('@vonage/server-sdk');

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

const VONAGE_SENDER = process.env.VONAGE_SENDER || 'VonageAPIs';

const sendSms = async ({ to, text }) => {
  try {
    const response = await vonage.sms.send({
      to,
      from: VONAGE_SENDER,
      text,
    });
    console.log('SMS sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('SMS sending failed:', error?.message || error);
    return { success: false, error };
  }
};

module.exports = { sendSms };
