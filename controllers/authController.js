const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/generateToken');
const { generateOTP, validateOTP } = require('../services/otpService');
// const { sendEmail } = require('../services/emailService');  // commented email for now
const { JWT_SECRET } = require('../config/jwt');

const { sendSMS } = require('../services/smsService');  // <-- Import SMS service

const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = new User({ username, email, password });
    await user.save();
    const token = generateToken(user);
    res.status(201).json({ token });
  } catch (err) {
    console.error('Register Error:', err.message);
    res.status(500).json({ message: 'Error registering user' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ message: 'Error logging in' });
  }
};

const forgotPassword = async (req, res) => {
  const { email, phone } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
    await user.save();

    // Email sending (commented for now)
    /*
    const emailHtml = `
      <h2>Password Reset OTP</h2>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This OTP will expire in 10 minutes.</p>
    `;

    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Password Reset OTP',
      html: emailHtml,
    });
    */

    // Send SMS if phone is provided
    let smsResult = null;
    if (phone) {
      const smsText = `Your OTP is ${otp}. It will expire in 10 minutes.`;
      smsResult = await sendSMS({ to: phone, text: smsText });

      if (!smsResult.success) {
        return res.status(500).json({ message: 'Failed to send OTP via SMS', error: smsResult.error });
      }
    }

    // You can update response as per SMS success
    // For now, just respond success if SMS sent or no phone provided
    res.json({ message: 'OTP sent successfully' + (phone ? ' via SMS' : '') });
  } catch (err) {
    console.error('Forgot Password Error:', err.message);
    res.status(500).json({ message: 'Error sending OTP' });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!validateOTP(user, otp)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // OTP verified - create password reset token valid for 15 minutes
    const passwordResetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });

    res.json({ message: 'OTP verified successfully', passwordResetToken });
  } catch (err) {
    console.error('Verify OTP Error:', err.message);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};

const resetPassword = async (req, res) => {
  const { passwordResetToken, newPassword } = req.body;
  try {
    const decoded = jwt.verify(passwordResetToken, JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(400).json({ message: 'Invalid or expired reset token' });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
};
