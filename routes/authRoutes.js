const express = require('express');
const router = express.Router();
const {
  register,
  verifyRegistrationOTP,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword
} = require('../controllers/authController');

// Debug log (optional)
console.log(" Auth routes loaded");

// Registration
router.post('/register', register);
router.post('/verify-registration-otp', verifyRegistrationOTP);

// Login
router.post('/login', login);

// Password Reset Flow
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP); // OTP for password reset
router.post('/set-new-password', resetPassword); // newPassword + resetToken

module.exports = router;
