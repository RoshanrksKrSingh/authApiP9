 require('dotenv').config();  // env variables load karne ke liye

const { Vonage } = require('@vonage/server-sdk');

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET
});

const from = process.env.VONAGE_SENDER;  
const to = "918808976555";               
const text = 'A text message sent using the Vonage SMS API';

async function sendSMS() {
    try {
        const resp = await vonage.sms.send({ to, from, text });
        console.log('Message sent successfully');
        console.log(resp);
    } catch (err) {
        console.log('There was an error sending the messages.');
        console.error(err);
    }
}

sendSMS();
