const mongoose = require('mongoose');

const tempOtpSchema = new mongoose.Schema({
  email: {
    type: String,required: true,lowercase: true,trim: true
  },
  otp: {
    type: String,required: true
  },
  firstName: {
    type: String,ired: true
  },
  lastName: {
    type: String,required: true
  },
  phone: {
    type: String,required: true
  },
  password: {
    type: String,required: true 
  },
  otpExpiry: {
    type: Date,required: true
  }
}, {
  timestamps: true 
});

module.exports = mongoose.model('TempOtp', tempOtpSchema);
