const express = require('express');
const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword
} = require('../controllers/authController');

console.log("Auth routes loaded");

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
// newPassword + passwordResetToken
router.post('/set-new-password', resetPassword); 

module.exports = router;
