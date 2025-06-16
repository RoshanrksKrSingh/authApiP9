const crypto = require('crypto');

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};


const validateOTP = (user, otp) => {
  if (user.otp !== otp) return false;
  if (new Date() > new Date(user.otpExpiry)) return false;
  return true;
};

module.exports = {
  generateOTP,
  validateOTP,
};
